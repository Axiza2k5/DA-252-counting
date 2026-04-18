from flask import Flask, render_template, jsonify
from ultralytics import YOLO
import subprocess
import time
import os

app = Flask(__name__)

MODEL_PATH = "/home/pi/counting_backend/best_ncnn_model"
CAPTURE_PATH = "/home/pi/counting_backend/static/capture.jpg"
RESULT_PATH  = "/home/pi/counting_backend/static/result.jpg"
CONF = 0.1
IOU  = 0.35

print("[INFO] Loading model...")
model = YOLO(MODEL_PATH)
print("[INFO] Model loaded!")


def capture_image():
    cmd = [
        "rpicam-still",
        "--output", CAPTURE_PATH,
        "--width",  "1280",
        "--height", "960",
        "--timeout", "2000",   # 2 giay autofocus
        "--nopreview",
        "-q", "90"             # JPEG quality
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Camera error: {result.stderr}")
"""
def capture_image():
    import shutil
    shutil.copy(
        "/home/pi/counting_backend/test_img.jpg",
        CAPTURE_PATH
    )
"""
def run_inference():
    results = model(
        CAPTURE_PATH,
        conf=CONF,
        iou=IOU,
        augment=True,   # multi-scale inference
        task='detect',
        verbose=False
    )

    result = results[0]
    count  = len(result.boxes)

    class_counts = {}
    for box in result.boxes:
        cls_name = model.names[int(box.cls[0])]
        class_counts[cls_name] = class_counts.get(cls_name, 0) + 1

    result.plot(
    line_width=1,        
    labels=False,      
    conf=False,         
    save=True,
    filename=RESULT_PATH)

    return {
        "count": count,
        "class_counts": class_counts,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/capture_and_count", methods=["POST"])
def capture_and_count():
    try:
        t_start = time.time()

        capture_image()
        data = run_inference()

        elapsed = round(time.time() - t_start, 2)
        data["time"] = elapsed
        data["image_url"] = f"/static/result.jpg?t={int(time.time())}"
        data["status"] = "ok"

        return jsonify(data)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
