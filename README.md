# AI Image Segmentation Web Application

Modern ve etkileşimli bir görüntü segmentasyonu web uygulaması.

Bu proje; kullanıcıların yüklediği görseller üzerinde farklı segmentasyon teknikleri uygulayarak mask ve overlay sonuçları üretmesini sağlar.

---

# Özellikler

- 🎯 Çoklu segmentasyon yöntemi
- 🧠 AI destekli MobileSAM segmentasyonu
- 🌗 Dark / Light tema desteği
- 🌍 Türkçe / İngilizce dil desteği
- ⚡ Gerçek zamanlı sonuç görüntüleme
- 🖼️ Maske ve overlay görünümü
- 💾 Segmentasyon sonucunu indirme
- 📱 Modern ve responsive kullanıcı arayüzü

---

# Kullanılan Teknolojiler

## Backend
- Python
- FastAPI
- OpenCV
- NumPy
- PyTorch
- MobileSAM

## Frontend
- Next.js
- React
- TypeScript
- TailwindCSS

---

# Desteklenen Segmentasyon Yöntemleri

| Yöntem | Açıklama |
|---|---|
| Binary Threshold | Sabit eşik değeri ile segmentasyon |
| Adaptive Threshold | Yerel eşikleme yöntemi |
| Otsu Threshold | Otomatik eşik belirleme |
| Canny Edge Detection | Kenar tabanlı segmentasyon |
| Blur + Threshold | Gürültü azaltmalı segmentasyon |
| MobileSAM AI | Yapay zeka destekli segmentasyon |

---

# Kurulum

## Repository Klonlama

```bash
git clone <repo-link>
cd segmentasyon-proje
```

---

# Backend Kurulumu

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend:
```text
http://127.0.0.1:8000
```

Swagger Docs:
```text
http://127.0.0.1:8000/docs
```

---

# Frontend Kurulumu

```bash
cd frontend

npm install

npm run dev
```

Frontend:
```text
http://localhost:3000
```

---

