# Đồ án 252 - Counting

## 1. Tổng quan dự án

Dự án này sử dụng mô hình **YOLOv26** để phát hiện và đếm cá từ hình ảnh tĩnh. Mục tiêu cốt lõi của dự án là cung cấp một giải pháp nhanh chóng, tiện lợi và chính xác nhằm giúp người dùng theo dõi số lượng cá trong không gian ao, bể hoặc các môi trường nuôi trồng thủy sản khác.

Dự án được chia thành hai luồng xử lý chính:
- **Ứng dụng Android:** Tích hợp mô hình nhẹ **YOLOv26m** chạy trực tiếp (local) trên thiết bị.
- **Backend server:** Vận hành mô hình **YOLOv26l** mạnh hơn, chính xác hơn, có thể được gọi từ ứng dụng khi cần thiết.

---

## 2. Các mô hình sử dụng

Hệ thống cung cấp sự linh hoạt bằng cách sử dụng hai biến thể của YOLOv26 để cân bằng giữa tốc độ và độ chính xác:

### YOLOv26m (Sử dụng Local)
- Chạy trực tiếp trên ứng dụng Android.
- Phù hợp để xử lý nhanh hình ảnh tĩnh ngay trên điện thoại.
- Cho ra kết quả nhanh chóng, đặc biệt cực kỳ tiện lợi khi thiết bị ở khu vực không có mạng Internet (offline).

### YOLOv26l (Sử dụng Server)
- Chạy trên cấu hình của Backend server.
- Là mô hình có khả năng tính toán mạnh hơn và đem lại độ chính xác cao hơn.
- Người dùng có thể dễ dàng gửi hình ảnh từ ứng dụng Android lên server thông qua Internet để sử dụng mô hình này.

---

## 3. Kiến trúc dự án

Dự án hoạt động dựa trên mô hình Client-Server với vai trò rõ ràng cho mỗi bên:

### Backend Server
- **Endpoint chính:** `/predict`
- **Mô tả hoạt động:** Nhận hình ảnh đầu vào từ ứng dụng di động hoặc từ người dùng.
- **Kết quả trả về:**
  - Số lượng cá đếm được trong ảnh.
  - Hình ảnh đã được đánh dấu (bounding boxes) chính xác vị trí của từng con cá.
- **Quản lý dữ liệu:** Server đảm nhiệm việc lưu lịch sử của tất cả các lần đếm cá vào cơ sở dữ liệu để tiện cho việc tra cứu, trích xuất sau này.

### Ứng dụng Android (Client)
- Tích hợp và chạy YOLOv26m ở chế độ local giúp phát hiện và đếm cá ngay lập tức từ hình ảnh.
- Cung cấp tính năng gửi hình ảnh trực tiếp đến Backend server để gọi YOLOv26l, mang lại kết quả chuẩn xác hơn khi cần.
- Cập nhật, đồng bộ và hiển thị lịch sử các lần đếm cá trước đó. Từ đó, hỗ trợ người dùng theo dõi xu hướng số lượng cá theo thời gian thực tế.

---

## 4. Tính năng chính

- **Phát hiện và đếm cá nhanh chóng:** Xử lý trực tiếp từ các hình ảnh tĩnh.
- **Lựa chọn mô hình linh hoạt:** Tùy chọn xử lý **local (YOLOv26m)** hoặc **backend (YOLOv26l)** để cân bằng phù hợp giữa tốc độ xử lý nhanh và độ chính xác cao.
- **Quản lý Lịch sử các lần đếm cá:**
  - Hiển thị đầy đủ thông tin về số lượng cá của từng lần đo.
  - Tự động lưu trữ thời gian và kết quả đếm của mỗi phiên.
  - Giao diện thân thiện giúp người nuôi trồng, quản lý dễ dàng kiểm tra và theo dõi xu hướng phát sinh số lượng cá theo từng ngày, từng tháng.

---

## 5. Thiết kế UX/UI
[Link Figma](https://www.figma.com/design/0VbTPxti4KP8T89Le7De29/Fish-counting?node-id=7-78&t=ayIkvKDVc4NahTl9-1)

Ứng dụng được thiết kế tối giản, tập trung vào trải nghiệm cốt lõi với 3 trang chính:

### 1. Trang Tương Tác (Chụp Ảnh & Đếm)
Đây là màn hình hoạt động chính để đưa hình ảnh vào hệ thống và bắt đầu đếm:
- **Nguồn ảnh linh hoạt:** Người dùng có thể chọn **Chụp ảnh trực tiếp** từ camera hoặc **Tải lên ảnh** từ thư viện của thiết bị.
- **Xem trước ảnh (Preview):** Hiển thị rõ ràng hình ảnh đã chọn hoặc vừa chụp ở khung trung tâm trước khi xử lý.
- **Lựa chọn mô hình:** Công tắc tùy chọn xử lý bằng **Local Model** (nhanh, không cần mạng) hoặc **Online Model** (gửi qua server để đếm chính xác hơn).
- **Bắt đầu (Start):** Nút hành động nổi bật nhất để hệ thống bắt đầu quá trình đếm cá.

### 2. Trang Kết Quả
Trang báo cáo thống kê hiển thị ngay sau khi hệ thống xử lý đếm xong:
- Nổi bật con số hiển thị **Tổng số lượng cá** đếm được.
- Cung cấp hình ảnh kết quả đã được vẽ trực quan các ô khoanh vùng (bounding box) quanh mỗi con cá để người dùng dễ dàng kiểm chứng.

### 3. Trang Lịch Sử
Trang giúp người dùng quản lý và theo dõi quá trình biến đổi số lượng cá theo thời gian:
- Giao diện hiển thị dưới dạng danh sách (List view) các lần đếm trước đó.
- Mỗi mục trong danh sách báo cáo tóm tắt các thông tin quan trọng: Hình ảnh nhỏ, Thời điểm đo (ngày/giờ cụ thể) và Kết quả số lượng con cá.