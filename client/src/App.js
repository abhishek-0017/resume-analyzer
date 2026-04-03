import React, { useState } from "react";
import "./App.css";

const API_URL = "https://resume-analyzer-backend-9dde.onrender.com";

function App() {
  const [text, setText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  // TEXT ANALYSIS
  const handleTextAnalyze = async () => {
    const res = await fetch(`${API_URL}/analyze-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, jobDesc }),
    });

    const data = await res.json();
    setResult(data);
  };

  // PDF ANALYSIS
  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobDesc", jobDesc);

    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="container">
      <h1>AI Resume Analyzer</h1>
      <p className="subtitle">ATS + Job Matching System</p>

      <div className="card">
        <h3>Paste Job Description</h3>
        <textarea
          placeholder="Paste job description..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />
      </div>

      <div className="card">
        <h3>Upload Resume (PDF)</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleFileUpload}>Analyze PDF</button>
      </div>

      <div className="card">
        <h3>Or Paste Resume Text</h3>
        <textarea
          placeholder="Paste resume here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={handleTextAnalyze}>Analyze Text</button>
      </div>

      <div className="card result">
        <h3>Results</h3>

        {result && (
          <>
            <h2>ATS Score: {result.score}/100</h2>

            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${result.score}%` }}
              ></div>
            </div>

            <h2>Job Match: {result.matchPercent}%</h2>

            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${result.matchPercent}%`, background: "#ff9800" }}
              ></div>
            </div>

            <h4>Missing Keywords:</h4>
            <p>{result.missing.join(", ") || "None 🎉"}</p>

            <pre>{result.feedback}</pre>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
