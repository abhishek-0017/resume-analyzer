import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);

  // 🔥 IMPORTANT: Replace with your backend URL
  const API_URL = "https://resume-analyzer-backend-9dde.onrender.com";

  // ✅ Analyze Text
  const analyzeText = async () => {
    try {
      const res = await axios.post(`${API_URL}/analyze-text`, {
        text: resumeText,
        jobDescription: jobDesc,
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing text");
    }
  };

  // ✅ Analyze PDF
  const analyzePDF = async () => {
    if (!file) {
      alert("Please upload a PDF");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDesc);

    try {
      const res = await axios.post(`${API_URL}/analyze-pdf`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing PDF");
    }
  };

  return (
    <div className="container">
      <h1>AI Resume Analyzer</h1>
      <p className="subtitle">ATS + Job Matching System</p>

      {/* Job Description */}
      <div className="card">
        <h3>Paste Job Description</h3>
        <textarea
          placeholder="Enter job description..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />
      </div>

      {/* Upload PDF */}
      <div className="card">
        <h3>Upload Resume (PDF)</h3>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br />
        <button onClick={analyzePDF}>Analyze PDF</button>
      </div>

      {/* Paste Text */}
      <div className="card">
        <h3>Or Paste Resume Text</h3>
        <textarea
          placeholder="Paste your resume text..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
        <button onClick={analyzeText}>Analyze Text</button>
      </div>

      {/* Results */}
      {result && (
        <div className="card result">
          <h3>Results</h3>

          {/* ATS Score */}
          <p>ATS Score: {result.score}/100</p>
          <div className="progress-bar">
            <div
              className="progress green"
              style={{ width: `${result.score || 0}%` }}
            >
              {result.score || 0}%
            </div>
          </div>

          {/* Job Match */}
          <p>Job Match: {result.matchPercent}%</p>
          <div className="progress-bar">
            <div
              className="progress orange"
              style={{ width: `${result.matchPercent || 0}%` }}
            >
              {result.matchPercent || 0}%
            </div>
          </div>

          {/* Missing Keywords */}
          <p><strong>Missing Keywords:</strong></p>
          {result.missingKeywords && result.missingKeywords.length > 0 ? (
            <ul>
              {result.missingKeywords.map((word, index) => (
                <li key={index}>{word}</li>
              ))}
            </ul>
          ) : (
            <p>None 🎉</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
