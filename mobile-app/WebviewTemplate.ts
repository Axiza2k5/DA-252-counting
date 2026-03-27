export const getWebviewHtml = (modelB64: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <!-- ONNX Runtime Web -->
    <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/ort.min.js"></script>
</head>
<body style="background: transparent; margin: 0; padding: 0;">
<script>
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';
    let session = null;

    async function initModel() {
        if(session) return session;
        const b64 = "${modelB64}";
        const binaryString = window.atob(b64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        session = await ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] });
        return session;
    }

    function preprocess(imageElement) {
        const targetSize = 640;
        const float32Data = new Float32Array(3 * targetSize * targetSize);
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(imageElement, 0, 0, targetSize, targetSize);
        
        const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
        const data = imgData.data;

        for (let c = 0; c < 3; c++) {
            for (let i = 0; i < targetSize * targetSize; i++) {
                float32Data[c * targetSize * targetSize + i] = data[i * 4 + c] / 255.0; 
            }
        }
        return new ort.Tensor('float32', float32Data, [1, 3, targetSize, targetSize]);
    }

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

    document.addEventListener("message", async function(event) {
        try {
            const payload = JSON.parse(event.data);
            
            if (payload.type === 'INIT') {
                await initModel();
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SYS', status: 'ready' }));
            }
            
            if (payload.type === 'INFER') {
                await initModel();
                const base64Img = payload.image;
                
                const img = new Image();
                img.onload = async () => {
                    const tensor = preprocess(img);
                    const feeds = { [session.inputNames[0]]: tensor };
                    
                    const startTime = performance.now();
                    const output = await session.run(feeds);
                    const latency = Math.round(performance.now() - startTime);

                    const outputTensor = output[session.outputNames[0]]; 
                    const data = outputTensor.data;
                    const outDims = outputTensor.dims; 
                    
                    const numClasses = outDims[1] - 4; 
                    const numAnchors = outDims[2]; 
                    
                    const boxes = [];
                    const CONF_THRESHOLD = 0.25;
                    const NMS_IOU = 0.45;
                    
                    for (let i = 0; i < numAnchors; i++) {
                        const xc = data[0 * numAnchors + i];
                        const yc = data[1 * numAnchors + i];
                        const w = data[2 * numAnchors + i];
                        const h = data[3 * numAnchors + i];
                        
                        let maxConf = -1;
                        for (let c = 0; c < numClasses; c++) {
                            const classProb = data[(4 + c) * numAnchors + i];
                            if (classProb > maxConf) maxConf = classProb;
                        }
                        
                        if (maxConf >= CONF_THRESHOLD) {
                            boxes.push({ coords: [xc, yc, w, h], conf: maxConf });
                        }
                    }
                    
                    boxes.sort((a, b) => b.conf - a.conf);
                    const resultBoxes = [];
                    
                    while (boxes.length > 0) {
                        const bestBox = boxes.shift();
                        resultBoxes.push(bestBox);
                        for (let i = boxes.length - 1; i >= 0; i--) {
                            if (iou(bestBox.coords, boxes[i].coords) > NMS_IOU) {
                                boxes.splice(i, 1);
                            }
                        }
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    
                    const x_ratio = img.width / 640.0;
                    const y_ratio = img.height / 640.0;
                    
                    for (let box of resultBoxes) {
                        const [xc, yc, w, h] = box.coords;
                        const x1 = (xc - w / 2) * x_ratio;
                        const y1 = (yc - h / 2) * y_ratio;
                        const w_real = w * x_ratio;
                        const h_real = h * y_ratio;
                        
                        ctx.strokeStyle = '#2dd4bf';
                        ctx.lineWidth = Math.max(2, Math.min(img.width, img.height) / 300);
                        ctx.strokeRect(x1, y1, w_real, h_real);
                        ctx.fillStyle = 'rgba(45, 212, 191, 0.4)';
                        ctx.fillRect(x1, y1, w_real, h_real);
                    }
                    
                    const base64Str = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'RESULT',
                        count: resultBoxes.length,
                        result_image_base64: base64Str,
                        latency_ms: latency
                    }));
                };
                img.src = base64Img;
            }
        } catch(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: e.toString() }));
        }
    });

    // Báo cho RN biết DOM WebView đã load xong
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SYS', status: 'dom_ready' }));
</script>
</body>
</html>
`;
