# 🏗 Cấu Trúc Dự Án & Giải Thích Module (AquaVision)

Tài liệu này giải thích chi tiết cách hệ thống hoạt động bên dưới, các module cấu thành và các kiến thức nền tảng cần thiết nếu bạn muốn chỉnh sửa hay nâng cấp mã nguồn.

---

## 1. Kiến Trúc Tổng Thể (Architecture Overview)

AquaVision là một hệ thống lai (Hybrid AI Application), cung cấp 2 chế độ Suy Luận (Inference):
- **Chế độ ONLINE:** Gửi ảnh lên Backend (máy chủ) để phân tích bằng GPU/CPU mạnh hơn.
- **Chế độ LOCAL:** Chạy trực tiếp mô hình AI trên thiết bị di động hoàn toàn không cần Internet.

Hệ thống được chia làm 3 phân hệ (module) chính:

### A. Backend AI Server (Thư mục `backend`)
Đóng vai trò là máy chủ xử lý dữ liệu nặng trong chế độ Online.
- **Công nghệ:** Python, FastAPI, Ultralytics.
- **Luồng hoạt động:** Nhận file ảnh qua API `POST /predict` -> Gọi YOLOv8 phân tích ảnh -> Vẽ Bounding Box trực tiếp lên ảnh -> Encode ảnh kết quả ra chuẩn Base64 -> Trả về JSON cho Mobile.
- **Kiến thức cần có:**
  - `FastAPI`: Cách tạo RESTful API nhanh, xử lý Multipart Form Data (Upload file).
  - `Ultralytics`: Cách load file trọng số `.pt`, bóc tách tọa độ Bounding Box, Confidence Score.
  - Xử lý ảnh (Pillow, IO Buffer) và chuyển đổi mã hóa `Base64`.

### B. Mobile App UI & Logic (Thư mục `mobile-app`)
Giao diện người dùng trên điện thoại.
- **Công nghệ:** React Native, Expo, NativeWind (TailwindCSS).
- **Luồng hoạt động:** Xin quyền Camera/Gallery sớm nhất có thể -> Khi chụp ảnh, bỏ qua bước lấy dữ liệu base64 trực tiếp từ Camera (để giảm độ trễ) -> Chuyển thành URI -> Đọc nội dung ảnh dưới dạng Base64 bằng I/O nền (`FileSystem`). Sau đó phân nhánh gửi ảnh cho Backend hoặc WebView tùy vào Mode.
- **Kiến thức cần có:**
  - `React Native Hooks` (useState, useEffect, useRef).
  - `Expo Camera & ImagePicker`: Quản lý quyền hệ thống (Permissions) trên Cấp độ Native.
  - `React Native Animated`: Sử dụng `Animated.timing`, `Animated.spring`, `interpolate` để tạo hiệu ứng mượt mà (chuyển đổi nút, trượt panel). Cần nắm khái niệm `useNativeDriver: true` để animation không bị giật bởi Main Thread.

### C. Local Edge AI (Module WebView ONNX)
Trái tim của tính năng OFFLINE. Model YOLO khổng lồ được nén và chạy ngay trên chip của điện thoại.
- **Công nghệ:** WebAssembly (WASM), ONNX Runtime Web, React Native WebView.
- **Luồng hoạt động:**
  1. Trọng số `.pt` được chuyển đổi sang `.onnx` và ép kiểu thành chuỗi siêu dài (`modelBase64.json`).
  2. Mobile App nhúng một UI ẩn HTML (`<WebView>`). HTML này tải bộ thư viện ONNX Web và dịch file Base64 ngược ra mảng byte Float32.
  3. Khi cần xử lý ảnh, App bắn ảnh gốc vào WebView. JS nội bộ sẽ tự động resize ảnh về `640x640`, chia chuẩn màu `/255.0` (Tiền xử lý).
  4. Đẩy ma trận Float32Array cho ONNX WASM tiến hành tính toán.
  5. JS áp dụng thuật toán **NMS** (Non-Maximum Suppression) tự code để thu gọn các hình nón trùng lặp, sau đó vẽ Canvas và trả ảnh lại cho thẻ App.
- **Kiến thức cần có:**
  - Tính toán ma trận Tensor.
  - `WebAssembly`: Giúp chạy thuật toán C++ ngay trong trình duyệt của điện thoại.
  - Thuật toán `IoU` (Intersection over Union) và `NMS` để gộp các Bounding Box chồng mép lên nhau.
  - Giao tiếp bất đồng bộ (PostMessage) giữa React Native Context và WebView Window.

---

## 2. Logic Tối Ưu Nổi Bật (Optimization Highlights)

Trong dự án này, có nhiều "thủ thuật" đã được áp dụng để mang lại trải nghiệm cấp số nhân:

1. **Animation Overlay Rendering:**
   - Thay vì dùng thuật toán `if (show) return <Component />` khiến React phải unmount/remount gây giật lag đồ họa.
   - Ứng dụng dùng `View` luôn hiển thị trên DOM nhưng bọc trong `pointerEvents="none"` kết hợp Opacity bằng `Animated`. Điều này giữ cho 60 FPS luôn đều đặn.

2. **Khử Độ Trễ Nút Chụp Ảnh (Camera Shutter Latency):**
   - Rất nhiều app Expo bị kẹt 2-3 giây ở dòng code khởi động Camera do thuộc tính `base64: true`.
   - Giải pháp: Camera chỉ trả về đường dẫn `URI` (tốn 0.1 giây) -> Ảnh ảo lập tức lên màn hình cho User xem -> Thuật toán tĩnh `FileSystem` sẽ đọc ngầm ảnh này thành chuỗi Base64 trả cho AI -> UX tối đa!

3. **Cơ chế Load Model 1 Lần (Initialization State):**
   - WebAssembly Model rất nặng, tốn tài nguyên. Do đó App không ép thư viện ONNX chạy trực tiếp.
   - Thẻ Webview sẽ load DOM -> gửi tín hiệu `dom_ready` lên App -> App gửi lệnh `INIT` -> ONNX tạo `InferenceSession` lưu lên RAM -> Thẻ Webview gửi trả `ready`. Chỉ khi quy trình này xong, nút Local mới hoạt động.
