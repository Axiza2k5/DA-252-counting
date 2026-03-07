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
4. Copy file mạng Neural YOLO (`best.pt`) của bạn thả trực tiếp vào thư mục `backend/`.
5. Khởi động server suy luận FastAPI:
   ```bash
   uvicorn main:app --reload
   ```
   *Terminal chớp nháy và API giờ sẽ lắng nghe và chờ xử lý ảnh ở `http://127.0.0.1:8000`*

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
   - Tạo file chỉ có tên `.env` nằm trong lòng thư mục `frontend/`
   - Dán nội dung liên kết Ngrok của bạn vào biến cấu hình chuẩn:
     ```env
     VITE_API_URL=https://XXXX-YYY.ngrok-free.app
     ```
4. Khởi chạy máy chủ giao diện máy cục bộ:
   ```bash
   npm run dev
   ```
5. Mở link Localhost hiển thị trên terminal để xem thử (thường là `http://localhost:5173`). Bạn cũng có thể commit và push thay đổi lên Vercel để nhận diện trên thiết bị di động với chuẩn giao diện PWA app.
