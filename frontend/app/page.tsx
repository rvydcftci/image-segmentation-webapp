"use client";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [prompt, setPrompt] = useState("");

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const sendToBackend = async () => {
    if (!image) return;
    // test

    const formData = new FormData();
    formData.append("file", image);
    formData.append("prompt", prompt); // 🔥 yeni eklendi

    const res = await fetch("http://127.0.0.1:8000/segment", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    // HEX → IMAGE
    const byteArray = new Uint8Array(
      data.image.match(/.{1,2}/g).map((b: any) => parseInt(b, 16))
    );

    const blob = new Blob([byteArray], { type: "image/png" });
    const url = URL.createObjectURL(blob);

    setResult(url);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🧠 AI Segmentasyon Sistemi</h1>

        {/* 🔥 PROMPT INPUT */}
        <input
          type="text"
          placeholder="Nesne gir (örn: banana)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={styles.input}
        />

        {/* FILE INPUT */}
        <input type="file" onChange={handleImage} style={styles.file} />

        {/* PREVIEW */}
        {preview && (
          <div>
            <h3>Yüklenen Görüntü</h3>
            <img src={preview} style={styles.image} />
          </div>
        )}

        {/* BUTTON */}
        <button onClick={sendToBackend} style={styles.button}>
          Segment Et
        </button>

        {/* RESULT */}
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

// 🎨 STYLE (modern UI)
const styles: any = {
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
    textAlign: "center",
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