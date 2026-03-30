# Cấu Trúc Dự Án & Giải Thích Module (AquaVision)

Tài liệu này giải thích chi tiết cách hệ thống hoạt động bên dưới, các module cấu thành và các kiến thức nền tảng cần thiết nếu bạn muốn chỉnh sửa hay nâng cấp mã nguồn.

---

## 1. Kiến Trúc Tổng Thể (Architecture Overview)

AquaVision là một hệ thống lai (Hybrid AI Application), cung cấp 2 chế độ Suy Luận (Inference):
- **Chế độ ONLINE:** Gửi ảnh lên Backend (máy chủ) để phân tích bằng GPU/CPU mạnh hơn.
- **Chế độ LOCAL:** Chạy trực tiếp mô hình AI trên thiết bị di động hoàn toàn không cần Internet.

Hệ thống được chia làm 3 phân hệ (module) chính:

### A. Backend AI Server (Thư mục `backend`)
Đóng vai trò là máy chủ xử lý dữ liệu nặng trong chế độ Online.
- **Công nghệ:** Python, FastAPI, Ultralytics YOLO26.
- **Luồng hoạt động:** Nhận file ảnh qua API `POST /predict` -> Gọi YOLO26 Large phân tích ảnh (`conf=0.5`) -> Vẽ Bounding Box trực tiếp lên ảnh -> Encode ảnh kết quả ra chuẩn Base64 -> Trả về JSON cho Mobile.
- **Kiến thức cần có:**
  - `FastAPI`: Cách tạo RESTful API nhanh, xử lý Multipart Form Data (Upload file).
  - `Ultralytics`: Cách load file trọng số `.pt`, bóc tách tọa độ Bounding Box, Confidence Score.
  - Xử lý ảnh (Pillow, IO Buffer) và chuyển đổi mã hóa `Base64`.

### B. Mobile App UI & Logic (Thư mục `mobile-app`)
Giao diện người dùng trên điện thoại.
- **Công nghệ:** React Native, Expo SDK 55, TypeScript.
- **Luồng hoạt động:** Xin quyền Camera/Gallery sớm nhất có thể -> Khi chụp ảnh, lấy URI -> Đọc nội dung ảnh dưới dạng Base64 bằng I/O nền (`FileSystem`). Sau đó phân nhánh gửi ảnh cho Backend hoặc WebView tùy vào Mode.
- **Kiến thức cần có:**
  - `React Native Hooks` (useState, useEffect, useRef).
  - `Expo Camera & ImagePicker`: Quản lý quyền hệ thống (Permissions) trên Cấp độ Native.
  - `React Native Animated`: Sử dụng `Animated.timing`, `Animated.spring`, `interpolate` để tạo hiệu ứng mượt mà (chuyển đổi nút, trượt panel). Cần nắm khái niệm `useNativeDriver: true` để animation không bị giật bởi Main Thread.

### C. Local Edge AI (Module WebView ONNX)
Trái tim của tính năng OFFLINE. Model YOLO26 Medium được chạy ngay trên chip của điện thoại.
- **Công nghệ:** WebAssembly (WASM), ONNX Runtime Web, React Native WebView.
- **Luồng hoạt động:**
  1. Trọng số `.pt` được chuyển đổi sang `.onnx` trong quá trình training.
  2. Script `build-release.bat` copy file `.onnx` vào `android/app/src/main/assets/` — nơi Android WebView có quyền truy cập trực tiếp qua giao thức `file:///android_asset/`.
  3. Mobile App nhúng một `<WebView>` ẩn, load file `webview.html` từ `file:///android_asset/webview.html`.
  4. Khi WebView sẵn sàng (DOM ready), nó dùng `XMLHttpRequest` tải `best.onnx` từ cùng thư mục `android_asset` thành `ArrayBuffer`, sau đó khởi tạo ONNX InferenceSession.
  5. Khi cần xử lý ảnh, App gửi ảnh (Base64) vào WebView qua `postMessage`. JS nội bộ sẽ **letterbox** ảnh về `640×640` (giữ tỷ lệ, padding xám `rgb(114,114,114)`) rồi normalize `/255.0`.
  6. Đẩy Tensor Float32Array cho ONNX WASM tính toán.
  7. Output YOLO26 ONNX có dạng `[1, 300, 6]` — đã tích hợp NMS sẵn trong model. Mỗi detection gồm `[x1, y1, x2, y2, confidence, class_id]` ở tọa độ `xyxy` trong không gian letterbox.
  8. JS lọc detection theo `confidence ≥ 0.5`, chuyển tọa độ letterbox về ảnh gốc, vẽ Canvas rồi trả kết quả về App.
- **Kiến thức cần có:**
  - Tính toán ma trận Tensor, hiểu cấu trúc output YOLO (format `xyxy` vs `xywh`).
  - `WebAssembly`: Giúp chạy thuật toán C++ ngay trong trình duyệt của điện thoại.
  - **Letterbox Preprocessing**: Kỹ thuật resize ảnh giữ nguyên tỷ lệ, thêm padding — giống hệt Ultralytics.
  - Giao tiếp bất đồng bộ (PostMessage) giữa React Native Context và WebView Window.
  - Android `file:///android_asset/` protocol: File trong `android/app/src/main/assets/` có thể truy cập từ WebView mà không bị chặn CORS.

---

## 2. Logic Tối Ưu Nổi Bật (Optimization Highlights)

Trong dự án này, có nhiều "thủ thuật" đã được áp dụng để mang lại trải nghiệm cấp số nhân:

1. **Animation Overlay Rendering:**
   - Thay vì dùng thuật toán `if (show) return <Component />` khiến React phải unmount/remount gây giật lag đồ họa.
   - Ứng dụng dùng `View` luôn hiển thị trên DOM nhưng bọc trong `pointerEvents="none"` kết hợp Opacity bằng `Animated`. Điều này giữ cho 60 FPS luôn đều đặn.

2. **Khử Độ Trễ Nút Chụp Ảnh (Camera Shutter Latency):**
   - Rất nhiều app Expo bị kẹt 2-3 giây ở dòng code khởi động Camera do thuộc tính `base64: true`.
   - Giải pháp: Camera chỉ trả về đường dẫn `URI` (tốn 0.1 giây) -> Ảnh ảo lập tức lên màn hình cho User xem -> Thuật toán tĩnh `FileSystem` sẽ đọc ngầm ảnh này thành chuỗi Base64 trả cho AI -> UX tối đa!

3. **Cơ chế Load Model qua Android Asset (Zero-Copy):**
   - File ONNX (~82MB) được đóng gói trực tiếp vào APK dưới dạng Android Asset.
   - WebView load từ `file:///android_asset/webview.html` → origin hợp lệ → XHR tải `best.onnx` cùng thư mục thành `ArrayBuffer` trực tiếp.
   - **Không qua Base64**, không qua cầu nối React Native Bridge, không tốn RAM trung gian.
   - Cơ chế cũ (encode file 82MB → chuỗi Base64 ~110MB → truyền qua JNI Bridge) gây lỗi `OutOfMemoryError` trên điện thoại. Cơ chế mới bỏ qua toàn bộ bước đó.

4. **YOLO26 End-to-End ONNX:**
   - YOLO26 export ONNX tích hợp sẵn NMS (Non-Maximum Suppression) bên trong graph.
   - Output `[1, 300, 6]` — không cần viết thêm thuật toán NMS thủ công.
   - Mỗi detection gồm `[x1, y1, x2, y2, conf, class]` — tọa độ `xyxy` (không phải `xywh` như YOLOv8 raw output).

---

## 3. Cấu Trúc File Quan Trọng

```
counting/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── model.py             # YOLO inference logic (conf=0.5)
│   └── models/best.pt       # Trọng số YOLO26 Large (Backend)
│
├── mobile-app/
│   ├── App.tsx               # Entry point, xử lý Online/Local mode
│   ├── assets/
│   │   ├── best.onnx         # Trọng số YOLO26 Medium (~82MB)
│   │   └── webview.html      # HTML chứa logic ONNX inference
│   ├── src/components/
│   │   └── MLWebView.tsx     # WebView wrapper (load từ android_asset)
│   ├── build-release.bat     # Auto build script (7 bước)
│   ├── start-all.bat         # Khởi động Backend + Ngrok
│   └── stop-all.bat          # Tắt tất cả
│
├── train_models.py           # Script huấn luyện YOLO26 (Large + Medium)
└── deploy_models.py          # Script copy model vào đúng thư mục
```
