#  Image Segmentation Web App

Bu proje, kullanıcıların yüklediği görseller üzerinde **image segmentation (görüntü segmentasyonu)** işlemi yapabilen bir web uygulamasıdır.

##  Proje Amacı

Bu projenin amacı, yapay zeka kullanarak bir görüntüdeki nesneleri ayırmak (segment etmek) ve kullanıcıya görsel olarak sunmaktır.

##  Kullanılan Teknolojiler

### Backend
- Python
- FastAPI
- NumPy
- OpenCV

### Frontend
- Next.js
- React
- TypeScript

##  Nasıl Çalışır?

1. Kullanıcı web arayüzünden bir görüntü yükler
2. Görüntü backend'e gönderilir
3. Backend görüntüyü işler ve segmentasyon uygular
4. Sonuç kullanıcıya geri gösterilir

##  Kurulum

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
