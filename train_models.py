import os
from ultralytics import YOLO


def train_and_export(model_name, dataset_path, is_local_app=False, name_prefix="train"):
    print(f"\n=============================================")
    print(f"🚀 KHỞI TẠO MÔ HÌNH: {model_name}")
    print(f"=============================================")
    try:
        model = YOLO(f"{model_name}.pt")
    except Exception as e:
        print(f"❌ LỖI: Không thể tải mô hình '{model_name}.pt'.")
        print("💡 GỢI Ý: Kiểm tra lại tên model (có thể bạn gõ nhầm 'yolo26' thay vì 'yolov8' hoặc 'yolo11'?).")
        raise e

    print(f"\n📦 STEP 1: Đang tiến hành Training {model_name}...")
    results = model.train(
        data=dataset_path, 
        epochs=100, 
        imgsz=640,
        batch=2,           # Giới hạn batch size để tiết kiệm RAM
        workers=0,         # Tắt đa luồng (multiprocessing) để tránh RAM x2
        cache=False,       # Tắt cache dataset
        save_period=-1,    # Không lưu checkpoint trung gian
        plots=False,       # Tắt vẽ ảnh phân tích
        device=0,          # Ép buộc sử dụng Card Đồ Họa (GPU 0) để train cực nhanh
        name=f"{name_prefix}_{model_name}"
    )

    best_pt_path = results.save_dir / 'weights' / 'best.pt'
    print(f"\n✅ Đã tạo xong Model Trọng Số: {best_pt_path}")

    if is_local_app:
        print("\n📦 STEP 2: Đang tiến hành Export model sang ONNX (Dành cho Local Frontend App)...")
        best_model = YOLO(best_pt_path)
        export_path = best_model.export(format='onnx', opset=12, dynamic=False)
        print(f"✅ Đã Xuất File Mạng Cục Bộ (ONNX): {export_path}")
        return best_pt_path, export_path
    
    return best_pt_path, None

def main():
    print("🚀 BẮT ĐẦU QUÁ TRÌNH HUẤN LUYỆN ĐA MÔ HÌNH AI...")
    
    dataset_path = 'dataset/data.yaml'
    
    if not os.path.exists(dataset_path):
        print(f"⚠️ Không tìm thấy thư mục {dataset_path}!")
        print("Sử dụng coco8.yaml (Dataset mẫu siêu nhỏ của Ultralytics) để demo quá trình sinh tệp model...")
        dataset_path = 'coco8.yaml'
    
    # Huấn luyện Backend (yolo26l)
    try:
        print("\n--- PHẦN 1: HUẤN LUYỆN BACKEND (LARGE MODEL) ---")
        backend_pt, _ = train_and_export("yolo26l", dataset_path, is_local_app=False, name_prefix="backend")
    except Exception as e:
        print(f"⏭️ DỪNG Huấn luyện Backend do lỗi: {e}")
        backend_pt = None

    # Huấn luyện Local (yolo26m)
    try:
        print("\n--- PHẦN 2: HUẤN LUYỆN LOCAL APP (MEDIUM MODEL) ---")
        local_pt, local_onnx = train_and_export("yolo26m", dataset_path, is_local_app=True, name_prefix="local")
    except Exception as e:
        print(f"⏭️ DỪNG Huấn luyện Local do lỗi: {e}")
        local_pt = None
        local_onnx = None

    print("\n🎉🎉🎉 HOÀN TẤT TOÀN BỘ QUÁ TRÌNH 🎉🎉🎉")
    if backend_pt:
        print(f"-> DÀNH CHO BACKEND: Copy '{backend_pt}' vào thư mục `backend/models/best.pt`.")
    if local_onnx:
        print(f"-> DÀNH CHO LOCAL: Copy file '{local_onnx}' vào `mobile-app/assets/best.onnx` (hoặc chạy deploy_models.py).")

if __name__ == '__main__':
    main()
