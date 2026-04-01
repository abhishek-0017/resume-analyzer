import React, { useState } from "react";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  // ✅ TEXT ANALYSIS
  const handleTextAnalyze = async () => {
    setResult("Analyzing Text... ⏳");

    try {
      const res = await fetch(
        "https://resume-analyzer-backend-9dde.onrender.com/analyze-text",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: resumeText }),
        }
      );

      const data = await res.json();
      console.log("TEXT RESPONSE:", data);

      setResult(data.analysis || "No result returned ❌");
    } catch (err) {
      console.error(err);
      setResult("Error analyzing text ❌");
    }
  };

  // ✅ PDF ANALYSIS
  const handleFileUpload = async () => {
    if (!file) {
      alert("Upload PDF first!");
      return;
    }

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
      console.log("PDF RESPONSE:", data);

      setResult(data.analysis || "No result returned ❌");
    } catch (err) {
      console.error(err);
      setResult("Error analyzing PDF ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Resume Analyzer 🚀</h1>

      {/* TEXT */}
      <h3>Paste Resume</h3>
      <textarea
        rows="10"
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
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <br />
      <button onClick={handleFileUpload}>Analyze PDF</button>

      <hr />

      {/* RESULT */}
      <h2>Result:</h2>
      <div
        style={{
          border: "1px solid black",
          padding: "10px",
          minHeight: "50px",
        }}
      >
        {result}
      </div>
    </div>
  );
}

export default App;
