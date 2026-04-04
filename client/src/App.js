import React, { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://resume-analyzer-backend-9dde.onrender.com";

  // TEXT
  const handleTextAnalyze = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/analyze-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, jobDesc })
      });

      const data = await res.json();
      setResult(data);
    } catch {
      alert("Error analyzing text");
    } finally {
      setLoading(false);
    }
  };

  // PDF
  const handlePDFAnalyze = async () => {
    if (!file) {
      alert("Upload PDF first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDesc", jobDesc);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      setResult(data);
    } catch {
      alert("Error analyzing PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AI Resume Analyzer</h1>
      <p>ATS + Job Matching System</p>

      {/* JOB DESC */}
      <div className="card">
        <h3>Paste Job Description</h3>
        <textarea
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />
      </div>

      {/* PDF */}
      <div className="card">
        <h3>Upload Resume (PDF)</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handlePDFAnalyze}>
          {loading ? "Analyzing..." : "Analyze PDF"}
        </button>
      </div>

      {/* TEXT */}
      <div className="card">
        <h3>Or Paste Resume Text</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={handleTextAnalyze}>
          {loading ? "Analyzing..." : "Analyze Text"}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div className="card result">
          <h3>Results</h3>

          <p>ATS Score: {result.score}/100</p>
          <div className="progress-bar">
            <div
              className="progress green"
              style={{ width: `${result.score || 0}%` }}
            >
              {result.score || 0}%
            </div>
          </div>

          <p>Job Match: {result.matchPercent}%</p>
          <div className="progress-bar">
            <div
              className="progress orange"
              style={{ width: `${result.matchPercent || 0}%` }}
            >
              {result.matchPercent || 0}%
            </div>
          </div>

          <p><b>Missing Keywords:</b></p>
          <p>
            {result.missing.length > 0
              ? result.missing.join(", ")
              : "None 🎉"}
          </p>

          <pre>{result.feedback}</pre>
        </div>
      )}

      {/* 🔥 SHOW EXTRACTED TEXT */}
      {result && result.text && (
        <div className="card">
          <h3>Extracted Resume Text</h3>
          <pre>{result.text.substring(0, 800)}...</pre>
        </div>
      )}
    </div>
  );
}

export default App;
