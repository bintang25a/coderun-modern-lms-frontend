import { useState } from "react";
import "../styles.css";

export default function HomePage() {
  const [language, setLanguage] = useState("c");
  const [codePath, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setOutput("Menjalankan kode...");
    try {
      const res = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJVMDAyIiwibmFtZSI6IlJpemt5IFByYXRhbWEiLCJyb2xlIjoiQXNpc3RlbiIsImlhdCI6MTc2MTQ2NDQ4OCwiZXhwIjoxNzYxNTUwODg4fQ.fwTWlyK6znTLDZJZYuayrwLTreHIq1KeX7u0ileKJIc",
        },
        body: JSON.stringify({ language, codePath, input }),
      });
      const data = await res.json();
      setOutput(data.output || "Tidak ada output.");
    } catch (err) {
      setOutput("Gagal terhubung ke server.", err);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Code Runner (C / C++ / Java)</h1>

      <div className="control">
        <label>Pilih Bahasa:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>

      <div className="editor">
        <label>Kode:</label>
        <textarea
          value={codePath}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Tulis kode di sini..."
        />
      </div>

      <div className="input-section">
        <label>Input (stdin):</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Masukkan input di sini..."
        />
      </div>

      <button onClick={runCode} disabled={loading}>
        {loading ? "Menjalankan..." : "Jalankan"}
      </button>

      <div className="output">
        <label>Output:</label>

        <pre>
          <code>{output}</code>
        </pre>
      </div>
    </div>
  );
}
