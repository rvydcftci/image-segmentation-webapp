from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2

app = FastAPI()

# CORS (frontend bağlantısı için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend çalışıyor 🚀"}

@app.post("/segment")
async def segment(file: UploadFile = File(...)):
    try:
        # Dosyayı oku
        contents = await file.read()

        # numpy array'e çevir
        np_arr = np.frombuffer(contents, np.uint8)

        # görüntüyü decode et
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # kontrol (bozuk dosya vs)
        if img is None:
            return {"error": "Görüntü okunamadı"}

        # griye çevir
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # threshold (basit segmentasyon)
        _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

        # tekrar image'e çevir
        _, buffer = cv2.imencode(".png", thresh)

        # frontend'e hex olarak gönder
        return {"image": buffer.tobytes().hex()}

    except Exception as e:
        return {"error": str(e)}