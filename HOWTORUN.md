# Hướng Dẫn Kéo & Chạy Toàn Bộ Dự Án (HOW TO RUN)

Tài liệu này hướng dẫn cách chạy toàn bộ dự án AquaVision từ A-Z một cách dễ dàng và nhanh chóng nhất.

---

## YÊU CẦU HỆ THỐNG
Trước khi bắt đầu, hãy đảm bảo hệ thống bạn đã được cài đặt các phần mềm sau:
1. **Python 3.10+** (Cho Backend & Training)
2. **Node.js 18+** (Cho Mobile App)
3. **Ngrok CLI** (`npm install -g ngrok` hoặc cài từ web ngrok) (Để đưa Local host lên mây)
4. **Java 17 (JDK)** và **Android Studio / Android SDK** (Để build file APK)
5. Điện thoại Android (Cắm cáp USB, bật chế độ Developer & USB Debugging)

** Yêu cầu về File Trọng Số (AI Weight):**
Bạn cần phải tự chuẩn bị 2 file sau khi đã Train AI xong:
- Bỏ file `best.pt` vào thư mục: `backend/models/best.pt` (Model YOLO26 Large cho Backend)
- Bỏ file `best.onnx` vào thư mục: `mobile-app/assets/best.onnx` (Model YOLO26 Medium cho Local)

> **LƯU Ý QUAN TRỌNG:** File `modelBase64.json` không còn được sử dụng nữa. Model local giờ sử dụng file `.onnx` nguyên bản được đặt trực tiếp vào `mobile-app/assets/`. Trong quá trình build, file ONNX sẽ được copy vào `android/app/src/main/assets/` để WebView truy cập trực tiếp mà không cần chuyển đổi Base64.

---

## PHƯƠNG PHÁP 1: CHẠY TỰ ĐỘNG (KHUYÊN DÙNG)
Dự án được trang bị sẵn Scripts cho hệ điều hành Windows.

### Bước 1: Khởi động Backend + Ngrok (1 Click)
Mở cửa sổ Terminal trong thư mục `mobile-app` và gõ:
```bash
.\start-all.bat
```
**Điều gì sẽ xảy ra?**
- Hệ thống sẽ chạy chìm (ẩn) Backend Python.
- Hệ thống sẽ chạy chìm Ngrok.
- Script sẽ tự lấy URL public của Ngrok và cập nhật vào `mobile-app/.env`.

### Bước 2: Biên dịch file APK
Vẫn ở tại thư mục `mobile-app`, chạy lệnh:
```bash
.\build-release.bat
```
**Điều gì sẽ xảy ra?** (7 bước tự động)
1. Xóa cache cũ của Expo (`npx expo prebuild --clean`)
2. Tự động thiết lập Android SDK path (`local.properties`)
3. Patch Gradle: nâng JVM heap lên 6GB, cấu hình JDK 17, giới hạn kiến trúc ARM
4. **Copy `best.onnx` và `webview.html` vào `android/app/src/main/assets/`** (quan trọng!)
5. Dừng các Gradle daemon cũ
6. Build APK release
- File APK: `mobile-app/android/app/build/outputs/apk/release/app-release.apk`
- Tự động cài APK lên điện thoại (nếu đã cắm cáp)

### Bước 3: Tắt tất cả
```bash
.\stop-all.bat
```

---

## PHƯƠNG PHÁP 2: CHẠY THỦ CÔNG (MANUAL)
Dành cho ai dùng Mac/Linux hoặc không muốn dùng cơ chế Auto-Scripts.

**1️⃣ Cài đặt Backend Server**
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Dùng source venv/bin/activate nếu trên Mac/Linux
pip install -r requirements.txt
pip install python-dotenv
uvicorn main:app --reload
```

**2️⃣ Bật hầm Ngrok (Mở Terminal Mới)**
```bash
ngrok http 8000
```
-> Copy URL màu xanh có chữ `https` của Ngrok.

**3️⃣ Thiết lập Mobile App (.env)**
Mở file `mobile-app/.env` và chỉnh sửa:
```env
EXPO_PUBLIC_API_URL=https://<NGROK_URL_VỪA_COPY_VÀO_ĐÂY>
```

**4️⃣ Build Mobile App (Mở Terminal Mới)**
```bash
cd mobile-app
npm install
npx expo prebuild --clean --platform android
```

**5️⃣ Copy file ONNX vào Android assets (BẮT BUỘC)**
```bash
mkdir -p android/app/src/main/assets
cp assets/best.onnx android/app/src/main/assets/best.onnx
cp assets/webview.html android/app/src/main/assets/webview.html
```
> **Bước này KHÔNG ĐƯỢC BỎ QUA.** Nếu thiếu, chế độ Local sẽ không hoạt động.

**6️⃣ Build APK**
```bash
npx expo run:android --variant release
```
-> File cài đặt nằm ở: `mobile-app/android/app/build/outputs/apk/release/app-release.apk`.
