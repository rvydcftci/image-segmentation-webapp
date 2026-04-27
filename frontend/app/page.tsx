"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (result) URL.revokeObjectURL(result);
    };
  }, [preview, result]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const sendToBackend = async () => {
    if (!image) return;

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("prompt", prompt);

      const res = await fetch("http://127.0.0.1:8000/segment", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Backend hata verdi");

      const data = await res.json();

      const byteArray = new Uint8Array(
        data.image.match(/.{1,2}/g).map((b: string) => parseInt(b, 16))
      );

      const blob = new Blob([byteArray], { type: "image/png" });
      const url = URL.createObjectURL(blob);

      setResult(url);
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu 😢");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🧠 AI Segmentasyon Sistemi</h1>

        <input
          type="text"
          placeholder="Nesne gir (örn: banana)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={styles.input}
        />

        <input type="file" onChange={handleImage} style={styles.file} />

        {preview && (
          <div>
            <h3>Yüklenen Görüntü</h3>
            <img src={preview} style={styles.image} />
          </div>
        )}

        <button onClick={sendToBackend} style={styles.button}>
          Segment Et
        </button>

        {result && (
          <div>
            <h3>Sonuç</h3>
            <img src={result} style={styles.image} />
          </div>
        )}
      </div>
    </div>
  );
}

/* 🔥 BURASI DIŞARIDA OLACAK */
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
  },
  card: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center" as const,
    width: "400px",
    color: "white",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
  },
  title: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "none",
  },
  file: {
    marginBottom: "10px",
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    background: "#3b82f6",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },
  image: {
    marginTop: "10px",
    width: "100%",
    borderRadius: "10px",
  },
};