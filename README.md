#  Image Segmentation Web App

Bu proje, kullanıcıların yüklediği görseller üzerinde **image segmentation (görüntü segmentasyonu)** işlemi yapabilen bir web uygulamasıdır.

---

##  Proje Amacı

Bu projenin amacı, bir görüntü içerisindeki nesneleri ayırmak (segment etmek) ve sonucu kullanıcıya görsel olarak sunmaktır.  
Uygulama, farklı segmentasyon yöntemlerini destekleyecek şekilde geliştirilmektedir.

---

##  Kullanılan Teknolojiler

###  Backend
- Python
- FastAPI
- NumPy
- OpenCV

###  Frontend
- Next.js
- React
- TypeScript

---

##  Kurulum

###  Backend Kurulumu

cd backend  
pip install -r requirements.txt  
uvicorn main:app --reload  

Backend çalıştıktan sonra:  
http://127.0.0.1:8000/docs  

---

###  Frontend Kurulumu

cd frontend  
npm install  
npm run dev  

Frontend çalıştıktan sonra:  
http://localhost:3000  

---


