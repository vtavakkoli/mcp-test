FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir fastapi uvicorn numpy
COPY server.py .

EXPOSE 6101
CMD ["python", "server.py"]
