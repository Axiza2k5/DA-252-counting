# Sử dụng Python bản slim để giảm dung lượng image
FROM python:3.10-slim

# Cài đặt các thư viện hệ thống cần thiết cho OpenCV và YOLO
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Tạo thư mục làm việc
WORKDIR /app

# Copy file requirements trước để tận dụng cache của Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn và model (.pt) vào container
COPY . .

# Mở port 8000 cho FastAPI
EXPOSE 8000

# Lệnh chạy server (sử dụng uvicorn)
CMD ["uvicorn", "main:app", "--host", "[IP_ADDRESS]", "--port", "8000"]