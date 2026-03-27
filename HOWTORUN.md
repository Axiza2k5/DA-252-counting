# 🚀 Hướng Dẫn Kéo & Chạy Toàn Bộ Dự Án (HOW TO RUN)

Tài liệu này hướng dẫn cách chạy toàn bộ dự án AquaVision từ A-Z một cách dễ dàng và nhanh chóng nhất.

---

## 🛑 YÊU CẦU HỆ THỐNG
Trước khi bắt đầu, hãy đảm bảo hệ thống bạn đã được cài đặt các phần mềm sau:
1. **Python 3.10+** (Cho Backend)
2. **Node.js 18+** (Cho Frontend & Mobile)
3. **Ngrok CLI** (`npm install -g ngrok` hoặc cài từ web ngrok) (Để đưa Local host lên mây)
4. **Java 17 (JDK)** và **Android Studio / Android SDK** (Để build file APK)
5. Điện thoại Android (Cắm cáp USB kết nối nội bộ hoặc chế độ Developer)

**📌 Yêu cầu về File Trọng Số (AI Weight):**
Bạn cần phải tự chuẩn bị 2 định dạng file cho YOLO (Sau khi đã Train AI xong):
- Bỏ file `best.pt` vào thư mục: `c:\counting\backend\models\best.pt`
- Bỏ file model base64 `modelBase64.json` vào thư mục: `c:\counting\mobile-app\modelBase64.json`

---

## 🔥 PHƯƠNG PHÁP 1: CHẠY TỰ ĐỘNG (KHUYÊN DÙNG)
Dự án được trang bị sẵn 3 Scripts cực kì mạnh mẽ cho hệ điều hành Windows để đảm nhiệm hầu hết các tác vụ nhàm chán.

### Bước 1: Khởi động mọi thứ cực nhanh (Vỏn vẹn 1 Click)
Mở cửa sổ Terminal/Command Prompt trong thư mục `mobile-app` và gõ:
```bash
.\start-all.bat
```
👉 **Điều gì sẽ xảy ra?**
- Hệ thống sẽ chạy chìm (ẩn) Backend Python.
- Hệ thống sẽ chạy chìm Ngrok.
- Script sẽ tự "câu" lấy đường link Public xịn của Ngrok và Update nó vào trực tiếp `mobile-app/.env` và `frontend/.env`. Bạn không cần phải copy dán mệt mỏi!

### Bước 2: Biên dịch file cài APK (Android Package)
Vẫn ở tại thư mục `mobile-app`, chạy lệnh:
```bash
.\build-release.bat
```
👉 **Điều gì sẽ xảy ra?**
- Nó sẽ xóa cache cũ của Expo (`npx expo prebuild --clean`).
- Tự động thay đổi Java Environment File ở trong folder cài đặt Android bằng JDK 17 cho chuẩn.
- Bắt đầu biên dịch ứng dụng với Gradle ra thẳng dạng Release siêu nhẹ.
- File APK sẽ nằm trong thư mục: `mobile-app\android\app\build\outputs\apk\release\app-release.apk`
- Điện thoại của bạn (nếu đã cắm cáp) sẽ được tự động cài App này luôn!

### Bước 3: Tắt máy về ngủ
Khác với ứng dụng bình thường, bạn nhớ rằng ở Bước 1 Ngrok và Backend đang CHẠY NGẦM. Nó sẽ không tự tắt kể cả khi bạn đóng máy. Để tắt chúng triệt để khỏi tốn RAM:
```bash
.\stop-all.bat
```

---

## 🐢 PHƯƠNG PHÁP 2: CHẠY THỦ CÔNG (MANUAL)
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

**4️⃣ Chạy và Build Mobile App (Mở Terminal Mới)**
```bash
cd mobile-app
npm install
npx expo prebuild --clean --platform android
npx expo run:android --variant release
```
-> File cài đặt nằm ở: `mobile-app/android/app/build/outputs/apk/release/app-release.apk`.
