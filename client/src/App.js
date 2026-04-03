import React, { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const API_URL = "https://resume-analyzer-backend-9dde.onrender.com"; // 🔥 CHANGE THIS

  // TEXT ANALYSIS
  const analyzeText = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch(`${API_URL}/analyze-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      setResult("Error analyzing text");
    }

    setLoading(false);
  };

  // PDF ANALYSIS
  const analyzePDF = async () => {
    if (!file) {
      alert("Please upload a file first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    setResult("");

    try {
      const response = await fetch(`${API_URL}/analyze-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      setResult("Error analyzing PDF");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>AI Resume Analyzer</h1>
      <p className="subtitle">Optimize your resume for ATS and recruiters</p>

      <div className="card">
        <h3>Upload PDF</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <br /><br />
        <button onClick={analyzePDF}>
          {loading ? "Analyzing..." : "Analyze PDF"}
        </button>
      </div>

      <div className="card">
        <h3>Or Paste Text</h3>
        <textarea
          placeholder="Paste your resume text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={analyzeText}>
          {loading ? "Analyzing..." : "Analyze Text"}
        </button>
      </div>

      <div className="card result">
        <h2>Results</h2>
        <pre>{result}</pre>
      </div>
    </div>
  );
}

export default App;
