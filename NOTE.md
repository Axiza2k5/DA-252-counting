# Hướng Dẫn Cài Đặt (Developer Setup Guide)

Dành cho các nhà phát triển muốn clone repository này và chạy thử ứng dụng AquaVision trên máy cá nhân một cách nhanh chóng kết hợp đường hầm Ngrok.

### Yêu Cầu Hệ Thống
- Đã cài đặt [Python 3.10+](https://www.python.org/)
- Đã cài đặt [Node.js 18+](https://nodejs.org/)
- Đã cài đặt [Ngrok](https://ngrok.com/download)
- Một file trọng số mô hình YOLO đã huấn luyện (`best.pt`)

---

### Các Bước Triển Khai

**Bước 1: Khởi động Backend AI (FastAPI)**
1. Mở Terminal và truy cập vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Tạo Virtual Environment và kích hoạt:
   ```bash
   python -m venv venv
   
   # Mới Windows (Command Prompt / PowerShell):
   venv\Scripts\activate
   
   # Với Mac/Linux:
   source venv/bin/activate
   ```
3. Cài đặt các thư viện Python chuyên sâu (AI/Computer Vision) cần thiết:
   ```bash
   pip install -r requirements.txt
   ```
4. (Tuỳ chọn) Cấu hình biến môi trường:
   - Dễ dàng thay đổi cấu hình bằng cách copy file `backend/.env.example` thành `backend/.env`
   - Chỉnh sửa file `.env` (Ví dụ đổi PORT sang số khác nếu port 8000 bị trùng).
5. Copy file mạng Neural YOLO (`best.pt`) của bạn thả trực tiếp vào thư mục `backend/`.
6. Khởi động server suy luận FastAPI:
   ```bash
   uvicorn main:app --reload
   ```
   *Terminal chớp nháy và API giờ sẽ tự động được gán vào `PORT` đã thiết lập (mặc định là `http://127.0.0.1:8000`)*

---

**Bước 2: Tạo Đường Hầm API bằng Ngrok**
Mục đích là để Vercel trên Internet có thể gọi xuống máy tính nội bộ của bạn.
1. Mở một cửa sổ Terminal thứ 2 (Để nguyên cửa sổ FastAPI chạy ẩn định).
2. Mở cổng 8000 theo dạng giao thức HTTP:
   ```bash
   ngrok http 8000
   ```
3. Đợi vài giây, Copy chính xác đường link Ngrok sinh ra có dạng `https://XXXX-YYY.ngrok-free.app` (Không lấy link localhost).

---

**Bước 3: Cấu hình và Khởi động Frontend (React Vite PWA)**
1. Mở một cửa sổ Terminal thứ 3 và di chuyển đến thư mục Frontend:
   ```bash
   cd frontend
   ```
2. Tái tạo lại thư mục `node_modules` (Tải lại toàn bộ Framework UI):
   ```bash
   npm install
   ```
3. Tạo file biến môi trường trung gian hệ thống:
   - Copy file `frontend/.env.example` đổi tên thành `frontend/.env`
   - Dán nội dung liên kết Ngrok của bạn vào biến cấu hình chuẩn:
     ```env
     VITE_API_URL=https://XXXX-YYY.ngrok-free.app
     ```
4. Khởi chạy máy chủ giao diện máy cục bộ:
   ```bash
   npm run dev
   ```
5. Mở link Localhost hiển thị trên terminal để xem thử (thường là `http://localhost:5173`). Bạn cũng có thể commit và push thay đổi lên Vercel để nhận diện trên thiết bị di động với chuẩn giao diện PWA app.

---

### Triển Khai Bằng Docker (Tuỳ chọn Nâng Cao)

Nếu bạn làm việc trên một máy tính hoàn toàn mới (như VPS của AWS hoặc DigitalOcean) và không muốn cài đặt lỉnh kỉnh các môi trường Python/Node, bạn có thể chạy toàn bộ Backend AI bằng **Docker**.

1. **Yêu cầu**: Cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Hoặc Docker Engine trên Linux).
2. Tải repository (clone code) về máy tính mới.
3. Đảm bảo bạn đã sao chép file `best.pt` bỏ vào trong thư mục `backend/`.
4. Mở Terminal và đứng tại thư mục gốc của project (có chứa file `docker-compose.yml`).
5. Kích hoạt toàn bộ hệ thống bằng câu lệnh:
   ```bash
   docker-compose up -d --build
   ```
   Lệnh này sẽ tự động tải các hệ điều hành ảo, cài đặt toàn bộ thư viện cần thiết cho AI và khởi chạy ngầm Server.
6. Khi hoàn tất, Backend AI lập tức sẽ túc trực tại cổng được định nghĩa (mặc định là `http://localhost:8000`). Bạn chỉ việc bật Ngrok như Bước 2 ở trên để đưa cổng này lên mạng là dùng được ngay.
