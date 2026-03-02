# Hệ Thống Đếm Giống Cua Bằng Thị Giác Máy Tính (YOLO)

Lộ trình dự án toàn diện để xây dựng hệ thống hỗ trợ AI tự động đếm và phát hiện ấu trùng thủy sinh (cá giống, cá con, tôm con, v.v.) bằng công nghệ phát hiện đối tượng YOLOv11.

---

## Mục Lục

1. [Giai Đoạn 1: Chuẩn Bị Dữ Liệu](#giai-đoạn-1-chuẩn-bị-dữ-liệu)
2. [Giai Đoạn 2: Huấn Luyện Mô Hình](#giai-đoạn-2-huấn-luyện-mô-hình)
3. [Giai Đoạn 3: Phát Triển Backend API](#giai-đoạn-3-phát-triển-backend-api)
4. [Giai Đoạn 4: Giao Diện Web Frontend](#giai-đoạn-4-giao-diện-web-frontend)
5. [Giai Đoạn 5: Triển Khai Docker](#giai-đoạn-5-triển-khai-docker)

---

## Giai Đoạn 1: Chuẩn Bị Dữ Liệu

**Mục Tiêu:** Chuẩn bị một bộ dữ liệu YOLO được định dạng đúng để huấn luyện mô hình AI.

### Bước 1.1: Thu Thập Hình Ảnh

- Sử dụng bộ dữ liệu hiện có từ Roboflow hoặc các nguồn công khai.
- Tải xuống bộ dữ liệu ở định dạng YOLO
- Tổ chức cấu trúc thư mục: train/val/test với thư mục images và labels tương ứng
- Đảm bảo file `data.yaml` chứa các đường dẫn và định nghĩa lớp chính xác

---

## Giai Đoạn 2: Huấn Luyện Mô Hình

**Mục Tiêu:** Huấn luyện một mô hình YOLO để phát hiện mẫu vật và lưu các trọng số đã huấn luyện dưới dạng `best.pt`.

### Bước 2.1: Thiết Lập Môi Trường

- Cài đặt Python 3.11 trên máy
- Tạo môi trường ảo Python
- Cài đặt các thư viện cần thiết: ultralytics, torch, numpy, opencv-python

### Bước 2.2: Cấu Hình Huấn Luyện

- Tạo tập lệnh Python để huấn luyện mô hình YOLO
- Cấu hình các tham số: số epoch, kích thước batch, kích thước hình ảnh
- Chọn kích thước mô hình phù hợp (nano, small, medium, large)
- Sử dụng gia tốc GPU nếu có (mps cho M1/M2 Mac, cuda cho NVIDIA)

### Bước 2.3: Thực Thi Huấn Luyện

- Chạy tập lệnh huấn luyện và giám sát các chỉ số (loss, mAP, precision, recall)
- Các trọng số mô hình tốt nhất được lưu tự động (best.pt)
- Xem kết quả huấn luyện thông qua biểu đồ và log

---

## Giai Đoạn 3: Phát Triển Backend API

**Mục Tiêu:** Tạo một máy chủ API (ví dụ: FastAPI) tải mô hình đã huấn luyện và cung cấp các điểm cuối suy luận.

### Bước 3.1: Thiết Lập Khung API

- Chọn khung web/API (FastAPI)
- Cài đặt các thư viện cần thiết
- Tạo cấu trúc dự án backend

### Bước 3.2: Tích Hợp Mô Hình

- Tải mô hình YOLO đã huấn luyện (best.pt) vào bộ nhớ
- Xây dựng logic xử lý suy luận
- Tạo hàm xử lý hình ảnh đầu vào

### Bước 3.3: Xây Dựng Điểm Cuối API

- Tạo điểm cuối `/predict` để nhận hình ảnh và trả về kết quả phát hiện
- Xử lý upload tệp và xử lý lỗi
- Trả về dữ liệu JSON chứa: số lượng phát hiện, hình ảnh kết quả, điểm tin cậy

### Bước 3.4: Triển Khai Backend

- Chạy server API trên cổng cụ thể (ví dụ: 8000)
- Kiểm tra các điểm cuối API thông qua công cụ (Postman, curl, v.v.)
- Xem tài liệu API tự động (nếu khung hỗ trợ)


---

## Giai Đoạn 4: Giao Diện Web Frontend

**Mục Tiêu:** Xây dựng một ứng dụng web thân thiện với người dùng để tải lên hình ảnh và hiển thị kết quả.

### Bước 4.1: Khởi Tạo Dự Án

- Chọn khung frontend (React)
- Cài đặt các phụ thuộc cần thiết
- Cấu hình công cụ xây dựng (Vite)

### Bước 4.2: Trang Tải Lên Hình Ảnh

- Tạo component cho phép người dùng chọn hình ảnh từ máy cục bộ
- Hiển thị xem trước hình ảnh được chọn
- Thêm nút gửi để upload tệp đến backend

### Bước 4.3: Hiển Thị Kết Quả

- Tạo component hiển thị số lượng phát hiện
- Hiển thị hình ảnh kết quả với các hộp giới hạn
- Hiển thị điểm tin cậy cho mỗi phát hiện
- Thêm nút để quay lại và tải lên hình ảnh mới

### Bước 4.4: Triển Khai Frontend

- Chạy máy chủ phát triển frontend
- Kiểm tra kết nối giữa frontend và backend API
- Xây dựng cho production (build output)


---

## Giai Đoạn 5: Triển Khai Docker

**Mục Tiêu:** Đóng gói toàn bộ ứng dụng (Frontend & Backend) để triển khai nhất quán trên các môi trường khác nhau.

### Bước 5.1: Cấu Hình Backend Docker

- Tạo `Dockerfile` cho backend với Python base image
- Sao chép requirements và cài đặt các thư viện Python
- Sao chép mã ứng dụng và mô hình đã huấn luyện
- Expose cổng API (ví dụ: 8000)
- Đặt lệnh khởi động cho server

### Bước 5.2: Cấu Hình Frontend Docker

- Tạo `Dockerfile` cho frontend với Node.js base image
- Xây dựng ứng dụng React thành các tệp tĩnh
- Sử dụng Nginx để phục vụ tệp tĩnh
- Proxy các yêu cầu API đến backend
- Expose cổng web (ví dụ: 80)

### Bước 5.3: Cấu Hình Docker Compose

- Tạo `docker-compose.yml` để định nghĩa các dịch vụ
- Cấu hình networking giữa backend và frontend
- Đặt các biến môi trường cần thiết
- Cấu hình volumes cho phát triển

### Bước 5.4: Triển Khai Hoàn Chỉnh

- Xây dựng và khởi động tất cả các dịch vụ bằng docker-compose
- Truy cập ứng dụng tại địa chỉ web
- Kiểm tra API tại tài liệu tự động (nếu có)
- Xem logs từ các container
- Dừng các dịch vụ khi cần

---

## Tham Chiếu Nhanh

### Cấu Trúc Dự Án Chính

```
project/
├── backend/              # Ứng dụng FastAPI
│   ├── main.py
│   ├── requirements.txt
│   └── best.pt
├── frontend/             # Ứng dụng React
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── Fish-Fry-1/          # Bộ dữ liệu
│   ├── data.yaml
│   ├── train/
│   ├── val/
│   └── test/
└── docker-compose.yml   # Cấu hình Docker
```

### Các Công Việc Chính

- **Huấn luyện:** Chạy tập lệnh huấn luyện YOLO với bộ dữ liệu đã chuẩn bị
- **Backend:** Khởi động API server sau khi có mô hình đã huấn luyện
- **Frontend:** Phát triển giao diện web kết nối với API
- **Docker:** Đóng gói toàn bộ ứng dụng để triển khai

---

## Performance Metrics

- **Model size:** YOLOv11s (small) - ~10MB
- **Inference speed:** ~50-100ms per image (GPU accelerated)
- **Accuracy:** mAP≥0.90 (target)
- **Supported image formats:** JPG, PNG, WEBP

---

## Ghi Chú & Các Thực Hành Tốt Nhất

1. **Tối Ưu Hóa Apple Silicon:** Sử dụng gia tốc `mps` trong huấn luyện cho M1/M2 Mac
2. **Tăng Cường Dữ Liệu:** Bật augmentation trong quá trình huấn luyện để cải thiện khả năng tổng quát hóa
3. **Lựa Chọn Mô Hình:** Bắt đầu với YOLOv11s, mở rộng lên YOLOv11m/l nếu cần cải thiện độ chính xác
4. **Kích Thước Batch:** Điều chỉnh dựa trên VRAM có sẵn (16-32 điển hình)
5. **Giám Sát:** Sử dụng Weights & Biases hoặc TensorBoard để theo dõi quá trình huấn luyện

---

## Future Enhancements

- [ ] Real-time video stream processing
- [ ] Batch image processing
- [ ] Custom model fine-tuning UI
- [ ] Statistical analysis dashboard
- [ ] Mobile app (React Native)
- [ ] Database storage of results
- [ ] User authentication system

---

## License

This project is designed for educational and research purposes.


