import React, { useState } from "react";
import "./App.css";

const API_URL = "https://resume-analyzer-backend-9dde.onrender.com";

function App() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  const handleTextAnalyze = async () => {
    try {
      const res = await fetch(`${API_URL}/analyze-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setResult(data.aiFeedback);
    } catch {
      setResult("Error analyzing text");
    }
  };

  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data.aiFeedback);
    } catch {
      setResult("Error analyzing PDF");
    }
  };

  return (
    <div className="container">
      <h1>AI Resume Analyzer</h1>
      <p className="subtitle">Get instant resume feedback</p>

      <div className="card">
        <h3>Upload Resume (PDF)</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleFileUpload}>Analyze PDF</button>
      </div>

      <div className="card">
        <h3>Or Paste Resume Text</h3>
        <textarea
          placeholder="Paste your resume here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={handleTextAnalyze}>Analyze Text</button>
      </div>

      <div className="card result">
        <h3>Results</h3>
        <pre>{result}</pre>
      </div>
    </div>
  );
}

export default App;
