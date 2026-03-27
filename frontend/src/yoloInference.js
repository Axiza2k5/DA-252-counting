import * as ort from 'onnxruntime-web';

// Configure ONNX Runtime to load WASM binaries from jsdelivr CDN matching the local npm version
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';

let session = null;

// Tải mô hình ONNX
export const initModel = async () => {
    if (session) return session;
    try {
        // Tải file mô hình ở thư mục public/models/best.onnx
        session = await ort.InferenceSession.create('/models/best.onnx', { executionProviders: ['wasm'] });
        console.log('ONNX Model loaded successfully');
        return session;
    } catch (err) {
        console.error('Failed to load ONNX model:', err);
        throw err;
    }
}

/**
 * Resize và crop ảnh ra đúng tỉ lệ YOLO yêu cầu là 640x640 và chuyển thành mảng Float32 Array có kích thước [1, 3, 640, 640] dạng CHW (Channel, Height, Width).
 */
function preprocess(imageElement) {
    const targetSize = 640;
    
    // Tạo mảng tensor kích thước phân bổ: 3 chiều màu x 640 x 640
    const float32Data = new Float32Array(3 * targetSize * targetSize);
    
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Resize ảnh bằng cách vẽ thu phóng lên khoảng 640x640, tuỳ chọn scale theo cạnh ngắn/dài nếu có Letterbox, 
    // Ở đây dùng scale cứng (Resize thẳng) để mô phỏng tương thích nhanh nhất
    ctx.drawImage(imageElement, 0, 0, targetSize, targetSize);
    
    const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
    const data = imgData.data;

    // Chuyển mảng HWC của Canvas imageData (R,G,B,A...) sang CHW cho PyTorch YOLO 
    for (let c = 0; c < 3; c++) {
        for (let i = 0; i < targetSize * targetSize; i++) {
            // data là mảng 4 luồng RGBA. Cắt cột chuẩn CHW (Channel, Height, Width)
            // Normalize gán pixel từ khoảng 0-255 thành từ 0.0 - 1.0 chuẩn YOLO
            float32Data[c * targetSize * targetSize + i] = data[i * 4 + c] / 255.0; 
        }
    }

    return new ort.Tensor('float32', float32Data, [1, 3, targetSize, targetSize]);
}

/**
 * Tính IOU (Intersection over Union) dành cho NMS
 */
function iou(box1, box2) {
    const interLeft = Math.max(box1[0] - box1[2]/2, box2[0] - box2[2]/2);
    const interTop = Math.max(box1[1] - box1[3]/2, box2[1] - box2[3]/2);
    const interRight = Math.min(box1[0] + box1[2]/2, box2[0] + box2[2]/2);
    const interBottom = Math.min(box1[1] + box1[3]/2, box2[1] + box2[3]/2);
    
    if (interRight < interLeft || interBottom < interTop) return 0.0;
    
    const interArea = (interRight - interLeft) * (interBottom - interTop);
    const area1 = box1[2] * box1[3];
    const area2 = box2[2] * box2[3];
    
    return interArea / (area1 + area2 - interArea);
}

/**
 * Khởi chạy đếm cá dựa vào TENSOR Image File blob
 */
export const runLocalInference = async (file) => {
    return new Promise(async (resolve, reject) => {
        try {
            await initModel();

            // Load ảnh
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = async () => {
                const tensor = preprocess(img);
                
                // Chuẩn bị đầu vào cho ONNX
                const feeds = {};
                feeds[session.inputNames[0]] = tensor; // Tên input mặc định là 'images'
                
                // Đo thời gian 
                const startTime = performance.now();
                const output = await session.run(feeds);
                const latency = Math.round(performance.now() - startTime);

                // YOLO output thường có dạng [1, 5, 8400]
                const outputTensor = output[session.outputNames[0]]; // Mảng dẹp Float32Array 
                const data = outputTensor.data;
                const outDims = outputTensor.dims; // [1, 5, 8400]
                
                const numClasses = outDims[1] - 4; // vd: 5 dòng - 4 hộp = 1 dòng (Confidence)
                const numAnchors = outDims[2]; // 8400 ô lưới
                
                const boxes = [];
                const CONF_THRESHOLD = 0.25;
                const NMS_IOU = 0.45;
                
                // Lặp qua 8400 ô anchor bbox
                for (let i = 0; i < numAnchors; i++) {
                    const xc = data[0 * numAnchors + i]; // x center
                    const yc = data[1 * numAnchors + i]; // y center
                    const w = data[2 * numAnchors + i];  // width
                    const h = data[3 * numAnchors + i];  // height
                    
                    let maxConf = -1;
                    
                    for (let c = 0; c < numClasses; c++) {
                        const classProb = data[(4 + c) * numAnchors + i];
                        if (classProb > maxConf) maxConf = classProb;
                    }
                    
                    if (maxConf >= CONF_THRESHOLD) {
                        boxes.push({
                            coords: [xc, yc, w, h], // Hệ toạ độ 640x640
                            conf: maxConf
                        });
                    }
                }
                
                // Sắp xếp giảm dần theo Confidence để chuẩn bị cho NMS
                boxes.sort((a, b) => b.conf - a.conf);
                const resultBoxes = [];
                
                // Non-Maximum Suppression (Lọc hộp bị đè lấp đúp nhau)
                while (boxes.length > 0) {
                    const bestBox = boxes.shift();
                    resultBoxes.push(bestBox);
                    
                    for (let i = boxes.length - 1; i >= 0; i--) {
                        if (iou(bestBox.coords, boxes[i].coords) > NMS_IOU) {
                            boxes.splice(i, 1);
                        }
                    }
                }
                
                // Sau khi có bbox chuẩn, render lên ảnh gốc và chụp Base64
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);
                
                // Bản đồ biến thiên tỷ lệ chuyển đổi toạ độ tử 640x640 sang Ảnh Gốc HD
                const x_ratio = img.width / 640.0;
                const y_ratio = img.height / 640.0;
                
                for (let box of resultBoxes) {
                    const [xc, yc, w, h] = box.coords;
                    
                    // Box YOLO trả về toạ độ điểm giữa, cần dịch về điểm góc trái/trên
                    const x1 = (xc - w / 2) * x_ratio;
                    const y1 = (yc - h / 2) * y_ratio;
                    const w_real = w * x_ratio;
                    const h_real = h * y_ratio;
                    
                    // Vẽ hình vuông bao (Cyan/Red)
                    ctx.strokeStyle = '#2dd4bf'; // teal-400 (Phù hợp với chủ đề Ocean của app)
                    ctx.lineWidth = Math.max(2, Math.min(img.width, img.height) / 300); // Dynamic stroke
                    ctx.strokeRect(x1, y1, w_real, h_real);
                    
                    // Nền Conf Box mờ
                    ctx.fillStyle = 'rgba(45, 212, 191, 0.4)';
                    ctx.fillRect(x1, y1, w_real, h_real);
                }
                
                const base64Str = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
                
                resolve({
                    count: resultBoxes.length,
                    result_image_base64: base64Str,
                    latency_ms: latency
                });
            };
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
};
