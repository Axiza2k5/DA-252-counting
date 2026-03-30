import os
import shutil
import base64
import json
import glob

def find_latest_dir(path_pattern):
    """Tìm thư mục mới nhất theo pattern (ví dụ: backend_yolo26l*)"""
    dirs = glob.glob(path_pattern)
    if not dirs:
        return None
    return max(dirs, key=os.path.getmtime)

def main():
    print("🚀 BẮT ĐẦU TRIỂN KHAI CÁC MODEL VỪA TRAIN XONG...\n")
    
    # 1. Triển khai Backend Model 
    backend_latest_dir = find_latest_dir("runs/detect/backend_yolo26l*")
    if backend_latest_dir:
        backend_pt = os.path.join(backend_latest_dir, "weights", "best.pt")
        target_backend_dir = os.path.join("backend", "models")
        os.makedirs(target_backend_dir, exist_ok=True)
        target_backend = os.path.join(target_backend_dir, "best.pt")
        
        if os.path.exists(backend_pt):
            shutil.copy2(backend_pt, target_backend)
            print(f"✅ Đã copy Backend Model từ {backend_pt} -> {target_backend}")
        else:
            print(f"⚠️ Thấy thư mục {backend_latest_dir} nhưng không có file best.pt")
    else:
        print("⚠️ Không tìm thấy kết quả train cho Backend!")

    print("-" * 50)
    
    # 2. Triển khai Local Model (Sao chép ONNX nguyên bản) 
    local_latest_dir = find_latest_dir("runs/detect/local_yolo26m*")
    if local_latest_dir:
        local_onnx = os.path.join(local_latest_dir, "weights", "best.onnx")
        target_local_dir = os.path.join("mobile-app", "assets")
        os.makedirs(target_local_dir, exist_ok=True)
        target_local_onnx = os.path.join(target_local_dir, "best.onnx")
        
        if os.path.exists(local_onnx):
            shutil.copy2(local_onnx, target_local_onnx)
            print(f"✅ Đã copy nguyên bản file ONNX vào {target_local_onnx} (Tránh gây quá tải RAM khi build App)")
            
            old_json = os.path.join("mobile-app", "modelBase64.json")
            if os.path.exists(old_json):
                os.remove(old_json)
                print(f"🗑️ Đã xóa file Base64 cũ ({old_json})")
        else:
            print(f"⚠️ Thấy thư mục {local_latest_dir} nhưng không có file best.onnx")
    else:
        print("⚠️ Không tìm thấy kết quả train (ONNX) cho Local App!")
        
    print("\n🎉 HOÀN TẤT VIỆC ĐƯA MODEL CHUẨN BỊ LÊN APP! Giờ bạn có thể Build lại App.")

if __name__ == "__main__":
    main()
