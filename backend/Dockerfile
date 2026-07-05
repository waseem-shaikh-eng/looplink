FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for qrcode[pil]
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.presentation.app:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
