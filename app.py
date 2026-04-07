import os
import asyncio
import warnings
import subprocess
import shutil
import tempfile
from concurrent.futures import ThreadPoolExecutor

warnings.filterwarnings("ignore")

try:
    import torch
    import librosa
    from transformers import WhisperProcessor, WhisperForConditionalGeneration
    VOICE_ENABLED = True
except ImportError:
    VOICE_ENABLED = False

from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import List
import uvicorn

from dotenv import load_dotenv

from llama_text_separate import extract_finance_data
from database import engine, get_db, Base
from models import User, Account, Category, Transaction, TransferDetail
from schemas import (
    UserCreate, UserOut,
    AccountCreate, AccountOut,
    CategoryOut,
    TransactionCreate, TransactionOut,
    BulkTransactionCreate,
)

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
device   = "cuda" if (VOICE_ENABLED and torch.cuda.is_available()) else "cpu"

# Category seed data — mirrors CATEGORY_META in the frontend
CATEGORY_SEED = [
    {"key": "food",          "label": "Meal",          "icon": "🍔", "color": "#6155F5"},
    {"key": "transport",     "label": "Transport",     "icon": "🚗", "color": "#34C759"},
    {"key": "grocery",       "label": "Grocery",       "icon": "🛒", "color": "#FF3830"},
    {"key": "home",          "label": "Home",          "icon": "🏠", "color": "#0088FF"},
    {"key": "clothing",      "label": "Clothing",      "icon": "👕", "color": "#FF9500"},
    {"key": "entertainment", "label": "Fun",           "icon": "🎮", "color": "#FF2D55"},
    {"key": "shopping",      "label": "Shopping",      "icon": "🛍️", "color": "#FF9500"},
    {"key": "health",        "label": "Health",        "icon": "💊", "color": "#30D158"},
    {"key": "education",     "label": "Education",     "icon": "📚", "color": "#0088FF"},
    {"key": "utilities",     "label": "Utilities",     "icon": "💡", "color": "#636366"},
    {"key": "other",         "label": "Other",         "icon": "⋯",  "color": "#8E8E93"},
]

processor = None
model     = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── DB: create tables ──────────────────────────────────────────────────────
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # ── DB: seed categories if empty ───────────────────────────────────────────
    async with engine.begin() as conn:
        from sqlalchemy import text
        result = await conn.execute(text("SELECT COUNT(*) FROM categories"))
        count = result.scalar()
        if count == 0:
            await conn.execute(
                Category.__table__.insert(),
                CATEGORY_SEED,
            )

    # ── Whisper model ──────────────────────────────────────────────────────────
    global processor, model
    if VOICE_ENABLED:
        print(f"Device: {device}")
        print("Whisper model yuklanmoqda...")
        processor = WhisperProcessor.from_pretrained("islomov/rubaistt_v2_medium", token=HF_TOKEN)
        model = WhisperForConditionalGeneration.from_pretrained("islomov/rubaistt_v2_medium", token=HF_TOKEN)
        model = model.to(device)
        model = torch.compile(model)
        print("Whisper model yuklandi!")
    else:
        print("Voice features disabled (torch not available)")

    yield


_executor = ThreadPoolExecutor(max_workers=2)

app = FastAPI(title="Finance Mini App", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ────────────────────────────────────────────────────────────────────
def _transcribe(audio_path: str) -> str:
    wav_path = audio_path.rsplit(".", 1)[0] + ".wav"
    subprocess.run(
        ["ffmpeg", "-i", audio_path, "-ar", "16000", "-ac", "1", wav_path, "-y"],
        capture_output=True,
    )
    waveform, _ = librosa.load(wav_path, sr=16000, mono=True)
    inputs = processor(waveform, sampling_rate=16000, return_tensors="pt", language="uz")
    input_features  = inputs.input_features.to(device)
    attention_mask  = torch.ones(input_features.shape[:2], dtype=torch.long).to(device)
    with torch.no_grad():
        predicted_ids = model.generate(
            input_features, attention_mask=attention_mask, suppress_tokens=[]
        )
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
    os.remove(audio_path)
    os.remove(wav_path)
    return transcription


async def _resolve_category(key: str | None, db: AsyncSession) -> int | None:
    if not key:
        return None
    result = await db.execute(select(Category).where(Category.key == key))
    cat = result.scalar_one_or_none()
    return cat.id if cat else None


# ── AI / voice endpoints ───────────────────────────────────────────────────────
@app.post("/transcribe_audio")
async def transcribe_audio_api(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(_executor, _transcribe, tmp_path)
    return {"text": result}


@app.post("/text_separate")
async def text_separate_api(payload: dict):
    text = payload.get("text")
    if not text:
        raise HTTPException(400, "No text provided")
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(_executor, extract_finance_data, text)
    return {"items": result}


# ── Users ──────────────────────────────────────────────────────────────────────
@app.post("/users", response_model=UserOut)
async def upsert_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, data.id)
    if not user:
        user = User(id=data.id, username=data.username)
        db.add(user)
        await db.flush()
        # Seed default Cash account for every new user
        db.add(Account(user_id=user.id, name="Cash", currency="UZS", balance=0))
        await db.commit()
        await db.refresh(user)
    return user


@app.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


# ── Accounts ───────────────────────────────────────────────────────────────────
@app.get("/users/{user_id}/accounts", response_model=List[AccountOut])
async def list_accounts(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Account).where(Account.user_id == user_id).order_by(Account.created_at.asc())
    )
    return result.scalars().all()


@app.post("/users/{user_id}/accounts", response_model=AccountOut)
async def create_account(user_id: int, data: AccountCreate, db: AsyncSession = Depends(get_db)):
    await db.execute(text("INSERT INTO users (id) VALUES (:uid) ON CONFLICT DO NOTHING"), {"uid": user_id})
    account = Account(user_id=user_id, **data.model_dump())
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


@app.delete("/accounts/{account_id}")
async def delete_account(account_id: int, db: AsyncSession = Depends(get_db)):
    account = await db.get(Account, account_id)
    if not account:
        raise HTTPException(404, "Account not found")
    if account.name == "Cash":
        raise HTTPException(400, "Default Cash account cannot be deleted")
    await db.delete(account)
    await db.commit()
    return {"ok": True}


# ── Categories ─────────────────────────────────────────────────────────────────
@app.get("/categories", response_model=List[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    return result.scalars().all()


# ── Transactions ───────────────────────────────────────────────────────────────
@app.get("/users/{user_id}/transactions", response_model=List[TransactionOut])
async def list_transactions(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
    )
    return result.scalars().all()


@app.post("/users/{user_id}/transactions", response_model=TransactionOut)
async def create_transaction(
    user_id: int, data: TransactionCreate, db: AsyncSession = Depends(get_db)
):
    await db.execute(text("INSERT INTO users (id) VALUES (:uid) ON CONFLICT DO NOTHING"), {"uid": user_id})
    category_id = await _resolve_category(data.category_key, db)
    tx = Transaction(
        user_id=user_id,
        account_id=data.account_id,
        category_id=category_id,
        type=data.type,
        amount=data.amount,
        note=data.note,
        source=data.source,
        date=data.date,
    )
    db.add(tx)
    await db.flush()

    if data.type == "transfer" and data.to_account_id:
        db.add(TransferDetail(transaction_id=tx.id, to_account_id=data.to_account_id))

    await db.commit()
    await db.refresh(tx)
    return tx


@app.post("/transactions/bulk", response_model=List[TransactionOut])
async def bulk_create_transactions(
    data: BulkTransactionCreate, db: AsyncSession = Depends(get_db)
):
    """Save all transactions at once — called when user taps 'Add N Transactions'."""
    created = []
    for item in data.items:
        category_id = await _resolve_category(item.category_key, db)
        tx = Transaction(
            user_id=data.user_id,
            account_id=item.account_id,
            category_id=category_id,
            type=item.type,
            amount=item.amount,
            note=item.note,
            source=data.source,
            date=item.date,
        )
        db.add(tx)
        await db.flush()

        if item.type == "transfer" and item.to_account_id:
            db.add(TransferDetail(transaction_id=tx.id, to_account_id=item.to_account_id))

        created.append(tx)

    await db.commit()
    for tx in created:
        await db.refresh(tx)
    return created


@app.put("/transactions/{tx_id}", response_model=TransactionOut)
async def update_transaction(
    tx_id: int, data: TransactionCreate, db: AsyncSession = Depends(get_db)
):
    tx = await db.get(Transaction, tx_id)
    if not tx:
        raise HTTPException(404, "Transaction not found")

    if data.category_key:
        tx.category_id = await _resolve_category(data.category_key, db)
    if data.account_id  is not None: tx.account_id = data.account_id
    if data.amount      is not None: tx.amount     = data.amount
    if data.type        is not None: tx.type       = data.type
    if data.note        is not None: tx.note       = data.note
    if data.source      is not None: tx.source     = data.source
    if data.date        is not None: tx.date       = data.date

    await db.commit()
    await db.refresh(tx)
    return tx


@app.delete("/transactions/{tx_id}")
async def delete_transaction(tx_id: int, db: AsyncSession = Depends(get_db)):
    tx = await db.get(Transaction, tx_id)
    if not tx:
        raise HTTPException(404, "Transaction not found")
    await db.delete(tx)
    await db.commit()
    return {"ok": True}


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
    )
