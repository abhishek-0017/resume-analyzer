import React, { useState } from "react";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  // TEXT ANALYSIS
  const handleTextAnalyze = async () => {
    setResult("Analyzing Text... ⏳");

    try {
      const res = await fetch(
        "https://resume-analyzer-backend-9dde.onrender.com/analyze-text",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: resumeText }),
        }
      );

      const data = await res.json();
      setResult(data.analysis);
    } catch {
      setResult("Error ❌");
    }
  };

  // PDF ANALYSIS
  const handleFileUpload = async () => {
    if (!file) return alert("Upload PDF first!");

    setResult("Analyzing PDF... ⏳");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch(
        "https://resume-analyzer-backend-9dde.onrender.com/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setResult(data.analysis);
    } catch {
      setResult("Error ❌");
    }
  };

  // JOB MATCH
  const handleJobMatch = async () => {
    setResult("Matching Job... ⏳");

    try {
      const res = await fetch(
        "https://resume-analyzer-backend-9dde.onrender.com/match-job",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, jobDesc }),
        }
      );

      const data = await res.json();
      setResult(data.analysis);
    } catch {
      setResult("Error ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Resume Analyzer 🚀</h1>

      {/* TEXT */}
      <h3>Paste Resume</h3>
      <textarea
        rows="8"
        cols="60"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />
      <br />
      <button onClick={handleTextAnalyze}>Analyze Text</button>

      <hr />

      {/* PDF */}
      <h3>Upload PDF Resume</h3>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <br />
      <button onClick={handleFileUpload}>Analyze PDF</button>

      <hr />

      {/* JOB MATCH */}
      <h3>Paste Job Description</h3>
      <textarea
        rows="8"
        cols="60"
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
      />
      <br />
      <button onClick={handleJobMatch}>Match Job</button>

      <hr />

      {/* RESULT */}
      <h2>Result:</h2>
      <div style={{ border: "1px solid black", padding: "10px" }}>
        {result}
      </div>
    </div>
  );
}

export default App;
