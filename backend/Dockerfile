# ── Build stage ────────────────────────────────────────────────────────────────
FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install PyTorch CPU-only first — separate layer so Docker caches it.
# CPU wheel is ~250 MB vs ~2 GB for the default CUDA wheel.
RUN pip install --no-cache-dir \
    torch \
    --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py database.py models.py schemas.py llama_text_separate.py ./

EXPOSE 5001
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001"]
