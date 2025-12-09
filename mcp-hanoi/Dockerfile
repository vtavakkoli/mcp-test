FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir fastapi uvicorn
COPY server.py .

EXPOSE 6102
CMD ["python", "server.py"]
