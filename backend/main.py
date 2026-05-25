from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import time
import os

try:
    import torch
    from mobile_sam import sam_model_registry, SamPredictor
except Exception:
    torch = None
    sam_model_registry = None
    SamPredictor = None


app = FastAPI(title="Image Segmentation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "mobile_sam.pt")

sam_predictor = None
sam_load_error = None


def load_sam_model():
    global sam_predictor, sam_load_error

    if sam_predictor is not None:
        return sam_predictor

    try:
        if torch is None or sam_model_registry is None or SamPredictor is None:
            raise RuntimeError("MobileSAM veya PyTorch kurulumu bulunamadı.")

        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model dosyası bulunamadı: {MODEL_PATH}")

        device = "cuda" if torch.cuda.is_available() else "cpu"

        sam = sam_model_registry["vit_t"](checkpoint=MODEL_PATH)
        sam.to(device=device)
        sam.eval()

        sam_predictor = SamPredictor(sam)
        return sam_predictor

    except Exception as e:
        sam_load_error = str(e)
        return None


@app.get("/")
def home():
    return {
        "message": "Backend çalışıyor 🚀",
        "methods": [
            "binary",
            "adaptive",
            "otsu",
            "canny",
            "blur_threshold",
            "sam",
        ],
        "sam_model_path": MODEL_PATH,
        "sam_ready": os.path.exists(MODEL_PATH),
        "sam_loaded": sam_predictor is not None,
        "sam_load_error": sam_load_error,
    }


def encode_image(image):
    success, buffer = cv2.imencode(".png", image)
    if not success:
        raise ValueError("Görüntü PNG formatına dönüştürülemedi.")
    return buffer.tobytes().hex()


def create_overlay(original, mask):
    if len(mask.shape) == 3:
        mask_gray = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
    else:
        mask_gray = mask

    colored_mask = np.zeros_like(original)
    colored_mask[:, :, 1] = mask_gray

    overlay = cv2.addWeighted(original, 0.7, colored_mask, 0.3, 0)
    return overlay


def run_mobile_sam(img):
    predictor = load_sam_model()

    if predictor is None:
        raise RuntimeError(sam_load_error or "MobileSAM modeli yüklenemedi.")

    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    predictor.set_image(rgb_img)

    height, width = rgb_img.shape[:2]

    input_point = np.array([[width // 2, height // 2]])
    input_label = np.array([1])

    masks, scores, logits = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=True,
    )

    best_index = int(np.argmax(scores))
    best_mask = masks[best_index]

    mask = best_mask.astype(np.uint8) * 255
    return mask, float(scores[best_index])


def run_ai_fallback(gray):
    blurred = cv2.GaussianBlur(gray, (11, 11), 0)

    _, mask = cv2.threshold(
        blurred,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )

    kernel = np.ones((5, 5), np.uint8)

    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    return mask


@app.post("/segment")
async def segment(
    file: UploadFile = File(...),
    method: str = Form("binary"),
    prompt: str = Form(""),
):
    try:
        start_time = time.time()

        if not file.content_type or not file.content_type.startswith("image/"):
            return {"error": "Lütfen geçerli bir görüntü dosyası yükleyin."}

        contents = await file.read()

        if not contents:
            return {"error": "Dosya boş görünüyor."}

        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return {"error": "Görüntü okunamadı."}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        method = method.lower()
        score = None

        if method == "binary":
            _, mask = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
            method_name = "Binary Threshold"

        elif method == "adaptive":
            mask = cv2.adaptiveThreshold(
                gray,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                11,
                2,
            )
            method_name = "Adaptive Threshold"

        elif method == "otsu":
            _, mask = cv2.threshold(
                gray,
                0,
                255,
                cv2.THRESH_BINARY + cv2.THRESH_OTSU,
            )
            method_name = "Otsu Threshold"

        elif method == "canny":
            mask = cv2.Canny(gray, 100, 200)
            method_name = "Canny Edge Detection"

        elif method == "blur_threshold":
            blurred = cv2.GaussianBlur(gray, (7, 7), 0)
            _, mask = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY)
            method_name = "Gaussian Blur + Threshold"

        elif method == "sam":
            try:
                mask, score = run_mobile_sam(img)
                method_name = "MobileSAM AI Segmentation"
            except Exception:
                mask = run_ai_fallback(gray)
                method_name = "AI Inspired Segmentation"

        else:
            return {
                "error": "Geçersiz segmentasyon yöntemi.",
                "available_methods": [
                    "binary",
                    "adaptive",
                    "otsu",
                    "canny",
                    "blur_threshold",
                    "sam",
                ],
            }

        overlay = create_overlay(img, mask)
        processing_time = round(time.time() - start_time, 4)

        return {
            "method": method,
            "method_name": method_name,
            "prompt": prompt,
            "processing_time": processing_time,
            "score": score,
            "mask": encode_image(mask),
            "overlay": encode_image(overlay),
            "image": encode_image(mask),
        }

    except Exception as e:
        return {"error": str(e)}