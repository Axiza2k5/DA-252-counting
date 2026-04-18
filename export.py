import os
import argparse
from ultralytics import YOLO

def export_to_onnx_and_cleanup(model_path, imgsz=640):
    print(f"\n=============================================")
    print(f"BẮT ĐẦU CHUYỂN ĐỔI MÔ HÌNH SANG ONNX")
    print(f"=============================================")
    
    if not os.path.exists(model_path):
        print(f"LỖI: Không tìm thấy file '{model_path}'")
        return

    try:
        print(f"\n Đang nạp mô hình: {model_path}...")
        model = YOLO(model_path)
        
        print(f"\n Đang tiến hành Export model sang ONNX (imgsz={imgsz}) ...")
        # The exported file is saved in the same directory by default
        export_path = model.export(format='onnx', imgsz=imgsz)
        
        print(f"\n Đã kích hoạt Xuất File! ONNX được tạo tại: {export_path}")
        
        # Optionally cleanup the heavy .pt file since mobile only needs ONNX
        print(f"\n Đang dọn dẹp file .pt gốc để giảm dung lượng bundle...")
        if os.path.exists(model_path):
            os.remove(model_path)
            print(f" Đã dọn dẹp thành công: {model_path}")

        print("\n HOÀN TẤT TOÀN BỘ QUÁ TRÌNH")

    except Exception as e:
        print(f"\n DỪNG Quá trình Export do nảy sinh lỗi: {e}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Chuyển đổi file PT sang ONNX và xóa file gốc.")
    parser.add_argument(
        '--model', 
        type=str, 
        default=os.path.join(os.getcwd(), 'mobile-app', 'assets', 'best.pt'), 
        help='Đường dẫn tới file .pt (Mặc định: mobile-app/assets/best.pt)'
    )
    parser.add_argument(
        '--imgsz', 
        type=int, 
        default=640, 
        help='Kích thước ảnh đầu vào (mặc định: 640)'
    )
    
    args = parser.parse_args()
    export_to_onnx_and_cleanup(args.model, args.imgsz)
