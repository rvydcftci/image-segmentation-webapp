"use client";

import { useEffect, useRef, useState } from "react";

type Language = "tr" | "en";
type Theme = "light" | "dark";
type Method = "binary" | "adaptive" | "otsu" | "canny" | "blur_threshold" | "sam";
type ResultView = "mask" | "overlay";

const methods: Method[] = [
  "binary",
  "adaptive",
  "otsu",
  "canny",
  "blur_threshold",
  "sam",
];

const methodLabels = {
  tr: {
    binary: "Binary Threshold",
    adaptive: "Adaptive Threshold",
    otsu: "Otsu Threshold",
    canny: "Canny Edge",
    blur_threshold: "Blur + Threshold",
    sam: "MobileSAM AI",
  },
  en: {
    binary: "Binary Threshold",
    adaptive: "Adaptive Threshold",
    otsu: "Otsu Threshold",
    canny: "Canny Edge",
    blur_threshold: "Blur + Threshold",
    sam: "MobileSAM AI",
  },
};

const methodDescriptions = {
  tr: {
    binary: "Sabit eşik değeriyle siyah-beyaz maske üretir.",
    adaptive: "Işık değişimlerine göre yerel eşikleme yapar.",
    otsu: "Eşik değerini otomatik olarak belirler.",
    canny: "Görüntüdeki kenarları ortaya çıkarır.",
    blur_threshold: "Bulanıklaştırma sonrası daha yumuşak maske üretir.",
    sam: "SAM tabanlı yapay zeka modeliyle nesne maskesi üretir.",
  },
  en: {
    binary: "Creates a black-white mask with a fixed threshold.",
    adaptive: "Applies local thresholding for changing light.",
    otsu: "Automatically calculates the threshold value.",
    canny: "Highlights object edges in the image.",
    blur_threshold: "Creates a smoother mask after Gaussian blur.",
    sam: "Generates an object mask using a SAM-based AI model.",
  },
};

const content = {
  tr: {
    appName: "AI Segmentasyon Sistemi",
    badge: "Görüntü İşleme • Web Uygulaması",
    heroTitle:
      "Görüntü segmentasyonunu sade, hızlı ve modern bir arayüzle deneyimle.",
    heroText:
      "Görselini yükle, segmentasyon yöntemini seç ve FastAPI tabanlı backend ile sonucu anında görüntüle.",
    promptLabel: "Nesne İpucu",
    promptPlaceholder: "Örn: banana, car, person",
    methodLabel: "Segmentasyon Yöntemi",
    viewLabel: "Sonuç Görünümü",
    maskView: "Maske",
    overlayView: "Overlay",
    uploadTitle: "Görsel yükle",
    uploadText: "Dosya seç veya görseli buraya sürükle",
    uploadHint: "PNG, JPG veya JPEG desteklenir",
    selectedFile: "Seçilen dosya",
    originalImage: "Orijinal Görüntü",
    resultImage: "Segmentasyon Sonucu",
    emptyOriginal: "Henüz görsel yüklenmedi",
    emptyResult: "Sonuç burada görüntülenecek",
    segment: "Segment Et",
    processing: "İşleniyor...",
    reset: "Temizle",
    download: "Sonucu İndir",
    processingTime: "İşlem süresi",
    usedMethod: "Kullanılan yöntem",
    errorNoImage: "Lütfen önce bir görsel yükle.",
    errorBackend: "Backend hata verdi.",
    errorGeneral: "Bir hata oluştu. Backend çalışıyor mu kontrol et.",
  },
  en: {
    appName: "AI Segmentation System",
    badge: "Image Processing • Web Application",
    heroTitle:
      "Experience image segmentation with a clean, fast and modern interface.",
    heroText:
      "Upload an image, choose a segmentation method, and instantly view the result using the FastAPI backend.",
    promptLabel: "Object Prompt",
    promptPlaceholder: "Ex: banana, car, person",
    methodLabel: "Segmentation Method",
    viewLabel: "Result View",
    maskView: "Mask",
    overlayView: "Overlay",
    uploadTitle: "Upload image",
    uploadText: "Choose a file or drag image here",
    uploadHint: "PNG, JPG or JPEG supported",
    selectedFile: "Selected file",
    originalImage: "Original Image",
    resultImage: "Segmentation Result",
    emptyOriginal: "No image uploaded yet",
    emptyResult: "Result will be displayed here",
    segment: "Segment",
    processing: "Processing...",
    reset: "Clear",
    download: "Download Result",
    processingTime: "Processing time",
    usedMethod: "Selected method",
    errorNoImage: "Please upload an image first.",
    errorBackend: "Backend returned an error.",
    errorGeneral: "An error occurred. Please check if the backend is running.",
  },
};

function hexToImageUrl(hex: string) {
  const hexParts = hex.match(/.{1,2}/g);
  if (!hexParts) throw new Error("Image data is invalid.");

  const byteArray = new Uint8Array(
    hexParts.map((b: string) => parseInt(b, 16))
  );

  const blob = new Blob([byteArray], { type: "image/png" });
  return URL.createObjectURL(blob);
}

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [maskResult, setMaskResult] = useState<string | null>(null);
  const [overlayResult, setOverlayResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<Language>("tr");
  const [theme, setTheme] = useState<Theme>("dark");
  const [method, setMethod] = useState<Method>("binary");
  const [resultView, setResultView] = useState<ResultView>("mask");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [methodName, setMethodName] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const t = content[language];
  const isDark = theme === "dark";
  const currentResult = resultView === "mask" ? maskResult : overlayResult;

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (maskResult) URL.revokeObjectURL(maskResult);
      if (overlayResult) URL.revokeObjectURL(overlayResult);
    };
  }, [preview, maskResult, overlayResult]);

  const clearResults = () => {
    if (maskResult) URL.revokeObjectURL(maskResult);
    if (overlayResult) URL.revokeObjectURL(overlayResult);

    setMaskResult(null);
    setOverlayResult(null);
    setProcessingTime(null);
    setMethodName("");
  };

  const setSelectedImage = (file: File) => {
    if (preview) URL.revokeObjectURL(preview);
    clearResults();

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setSelectedImage(file);
  };

  const sendToBackend = async () => {
    if (!image) {
      setError(t.errorNoImage);
      return;
    }

    try {
      setLoading(true);
      setError("");
      clearResults();

      const formData = new FormData();
      formData.append("file", image);
      formData.append("prompt", prompt);
      formData.append("method", method);

      const res = await fetch("http://127.0.0.1:8000/segment", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(t.errorBackend);

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const maskUrl = hexToImageUrl(data.mask || data.image);
      const overlayUrl = hexToImageUrl(data.overlay || data.mask || data.image);

      setMaskResult(maskUrl);
      setOverlayResult(overlayUrl);
      setProcessingTime(data.processing_time ?? null);
      setMethodName(data.method_name ?? methodLabels[language][method]);
    } catch (err) {
      console.error(err);
      setError(t.errorGeneral);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    if (preview) URL.revokeObjectURL(preview);
    clearResults();

    setImage(null);
    setPreview(null);
    setPrompt("");
    setError("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main
      className={`relative min-h-screen overflow-x-hidden transition-colors duration-500 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-950"
        }`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 ${isDark
            ? "bg-[radial-gradient(circle_at_top_left,#1d4ed850,transparent_35%),radial-gradient(circle_at_top_right,#7c3aed40,transparent_35%)]"
            : "bg-[radial-gradient(circle_at_top_left,#bfdbfe,transparent_35%),radial-gradient(circle_at_top_right,#ddd6fe,transparent_35%)]"
          }`}
      />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8">
        <nav
          className={`mb-10 flex flex-col gap-4 rounded-3xl border px-5 py-4 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between ${isDark
              ? "border-white/10 bg-white/5"
              : "border-slate-200 bg-white/70"
            }`}
        >
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {t.appName}
            </h1>
            <p
              className={
                isDark ? "text-sm text-slate-400" : "text-sm text-slate-500"
              }
            >
              {t.badge}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
              className={`relative flex h-11 w-24 items-center rounded-full border p-1 transition ${isDark
                  ? "border-white/10 bg-white/10"
                  : "border-slate-200 bg-slate-100"
                }`}
            >
              <span
                className={`absolute left-1 top-1 h-9 w-11 rounded-full bg-blue-600 shadow-md transition-transform duration-300 ${language === "en" ? "translate-x-11" : "translate-x-0"
                  }`}
              />
              <span
                className={`relative z-10 flex-1 text-center text-sm font-bold transition ${language === "tr"
                    ? "text-white"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
              >
                TR
              </span>
              <span
                className={`relative z-10 flex-1 text-center text-sm font-bold transition ${language === "en"
                    ? "text-white"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
              >
                EN
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`relative flex h-11 w-36 items-center rounded-full border p-1 transition ${isDark
                  ? "border-white/10 bg-white/10"
                  : "border-slate-200 bg-slate-100"
                }`}
            >
              <span
                className={`absolute left-1 top-1 h-9 w-[66px] rounded-full shadow-md transition-transform duration-300 ${isDark
                    ? "translate-x-[68px] bg-slate-900"
                    : "translate-x-0 bg-blue-600"
                  }`}
              />
              <span
                className={`relative z-10 flex-1 text-center text-xs font-bold transition ${!isDark ? "text-white" : "text-slate-400"
                  }`}
              >
                LIGHT
              </span>
              <span
                className={`relative z-10 flex-1 text-center text-xs font-bold transition ${isDark ? "text-white" : "text-slate-500"
                  }`}
              >
                DARK
              </span>
            </button>
          </div>
        </nav>

        <div className="grid flex-1 items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="pt-8">
            <div
              className={`mb-5 inline-flex rounded-full border px-4 py-2 text-sm ${isDark
                  ? "border-blue-400/30 bg-blue-400/10 text-blue-200"
                  : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
            >
              {t.badge}
            </div>

            <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t.heroTitle}
            </h2>

            <p
              className={`mt-6 max-w-xl text-base leading-8 sm:text-lg ${isDark ? "text-slate-300" : "text-slate-600"
                }`}
            >
              {t.heroText}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Next.js", "FastAPI", "OpenCV"].map((item) => (
                <div
                  key={item}
                  className={`rounded-2xl border p-4 text-center text-sm font-semibold shadow-sm ${isDark
                      ? "border-white/10 bg-white/5"
                      : "border-slate-200 bg-white"
                    }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`rounded-[2rem] border p-5 shadow-2xl backdrop-blur-xl sm:p-6 ${isDark
                ? "border-white/10 bg-white/10 shadow-black/30"
                : "border-slate-200 bg-white/80 shadow-slate-200"
              }`}
          >
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold">
                {t.promptLabel}
              </label>
              <input
                type="text"
                placeholder={t.promptPlaceholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:ring-4 ${isDark
                    ? "border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring-blue-500/20"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-200"
                  }`}
              />
            </div>

            <div className="mb-5">
              <p className="mb-3 text-sm font-semibold">{t.methodLabel}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {methods.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMethod(item);
                      clearResults();
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${method === item
                        ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : isDark
                          ? "border-white/10 bg-slate-950/40 text-slate-200 hover:border-blue-400"
                          : "border-slate-200 bg-white text-slate-800 hover:border-blue-400"
                      }`}
                  >
                    <div className="text-sm font-bold">
                      {methodLabels[language][item]}
                    </div>
                    <div
                      className={`mt-1 text-xs leading-5 ${method === item
                          ? "text-blue-100"
                          : isDark
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                    >
                      {methodDescriptions[language][item]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImage}
              className="hidden"
            />

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-3xl border-2 border-dashed p-6 text-center transition ${dragActive
                  ? "border-blue-400 bg-blue-500/10"
                  : isDark
                    ? "border-white/15 bg-slate-950/40 hover:border-blue-400/70"
                    : "border-slate-300 bg-slate-50 hover:border-blue-500"
                }`}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-2xl text-white">
                ↑
              </div>
              <h3 className="text-lg font-semibold">{t.uploadTitle}</h3>
              <p
                className={
                  isDark
                    ? "mt-1 text-sm text-slate-400"
                    : "mt-1 text-sm text-slate-500"
                }
              >
                {t.uploadText}
              </p>
              <p
                className={
                  isDark
                    ? "mt-2 text-xs text-slate-500"
                    : "mt-2 text-xs text-slate-400"
                }
              >
                {t.uploadHint}
              </p>
            </div>

            {image && (
              <p
                className={
                  isDark
                    ? "mt-3 text-sm text-slate-400"
                    : "mt-3 text-sm text-slate-500"
                }
              >
                {t.selectedFile}:{" "}
                <span className="font-medium">{image.name}</span>
              </p>
            )}

            {error && (
              <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">{t.viewLabel}</p>

              <div
                className={`flex rounded-full border p-1 ${isDark
                    ? "border-white/10 bg-white/10"
                    : "border-slate-200 bg-slate-100"
                  }`}
              >
                <button
                  type="button"
                  onClick={() => setResultView("mask")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${resultView === "mask"
                      ? "bg-blue-600 text-white shadow-md"
                      : isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                >
                  {t.maskView}
                </button>
                <button
                  type="button"
                  onClick={() => setResultView("overlay")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${resultView === "overlay"
                      ? "bg-blue-600 text-white shadow-md"
                      : isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                >
                  {t.overlayView}
                </button>
              </div>
            </div>

            {(methodName || processingTime !== null) && (
              <div
                className={`mt-4 grid gap-3 rounded-2xl border p-4 text-sm sm:grid-cols-2 ${isDark
                    ? "border-white/10 bg-slate-950/40 text-slate-300"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
              >
                <div>
                  <span className="font-semibold">{t.usedMethod}:</span>{" "}
                  {methodName}
                </div>
                <div>
                  <span className="font-semibold">{t.processingTime}:</span>{" "}
                  {processingTime !== null ? `${processingTime} sn` : "-"}
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ImagePanel
                title={t.originalImage}
                imageUrl={preview}
                emptyText={t.emptyOriginal}
                isDark={isDark}
              />
              <ImagePanel
                title={
                  resultView === "mask"
                    ? `${t.resultImage} (${t.maskView})`
                    : `${t.resultImage} (${t.overlayView})`
                }
                imageUrl={currentResult}
                emptyText={t.emptyResult}
                isDark={isDark}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={sendToBackend}
                disabled={!image || loading}
                className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? t.processing : t.segment}
              </button>

              <button
                type="button"
                onClick={resetAll}
                className={`rounded-2xl px-5 py-3 font-semibold transition ${isDark
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                {t.reset}
              </button>

              {currentResult && (
                <a
                  href={currentResult}
                  download={`segmentation-${resultView}.png`}
                  className={`rounded-2xl px-5 py-3 text-center font-semibold transition ${isDark
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "bg-emerald-600 text-white hover:bg-emerald-500"
                    }`}
                >
                  {t.download}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ImagePanel({
  title,
  imageUrl,
  emptyText,
  isDark,
}: {
  title: string;
  imageUrl: string | null;
  emptyText: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border ${isDark
          ? "border-white/10 bg-slate-950/50"
          : "border-slate-200 bg-white"
        }`}
    >
      <div
        className={`border-b px-4 py-3 text-sm font-semibold ${isDark ? "border-white/10" : "border-slate-200"
          }`}
      >
        {title}
      </div>

      <div className="flex aspect-square items-center justify-center p-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full rounded-2xl object-contain"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center rounded-2xl text-center text-sm ${isDark ? "bg-white/5 text-slate-500" : "bg-slate-50 text-slate-400"
              }`}
          >
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}