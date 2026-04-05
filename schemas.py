from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


# ── Users ──────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    id: int                        # Telegram user_id
    username: Optional[str] = None


class UserOut(BaseModel):
    id: int
    username: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Accounts ───────────────────────────────────────────────────────────────────
class AccountCreate(BaseModel):
    name: str
    currency: str = "UZS"
    balance: Decimal = Decimal("0")


class AccountOut(BaseModel):
    id: int
    user_id: int
    name: str
    currency: str
    balance: Decimal

    model_config = {"from_attributes": True}


# ── Categories ─────────────────────────────────────────────────────────────────
class CategoryOut(BaseModel):
    id: int
    key: str
    label: Optional[str]
    icon: Optional[str]
    color: Optional[str]

    model_config = {"from_attributes": True}


# ── Transactions ───────────────────────────────────────────────────────────────
class TransactionCreate(BaseModel):
    account_id:   Optional[int]   = None
    category_key: Optional[str]   = None   # resolved to category_id on the server
    type:         str              = "expense"
    amount:       Decimal
    note:         Optional[str]   = None
    source:       str              = "manual"
    date:         Optional[date]  = None
    to_account_id: Optional[int]  = None   # only for transfers


class TransactionOut(BaseModel):
    id:          int
    user_id:     int
    account_id:  Optional[int]
    category_id: Optional[int]
    type:        str
    amount:      Decimal
    note:        Optional[str]
    source:      str
    date:        date
    created_at:  datetime

    model_config = {"from_attributes": True}


# ── Bulk save (from AI screen) ─────────────────────────────────────────────────
class BulkTransactionCreate(BaseModel):
    user_id: int
    source:  str = "ai"
    items:   List[TransactionCreate]
