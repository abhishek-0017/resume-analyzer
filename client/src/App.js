import React, { useState } from "react";
import "./App.css";

const API_URL = "https://resume-analyzer-backend-9dde.onrender.com";

function App() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");


  // ✅ TEXT ANALYSIS (AI)
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

      // 🔥 SHOW AI RESPONSE
      setResult(data.aiFeedback || "No response from AI");

    } catch (error) {
      setResult("Error analyzing text");
    }
  };


  // ✅ PDF ANALYSIS (AI)
  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // 🔥 SHOW AI RESPONSE
      setResult(data.aiFeedback || "No response from AI");

    } catch (error) {
      setResult("Error analyzing PDF");
    }
  };


  return (
    <div className="App">
      <h1>AI Resume Analyzer</h1>
      <p>Get AI-powered feedback on your resume</p>

      <h3>Upload PDF</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={handleFileUpload}>Analyze PDF</button>

      <h3>Or Paste Text</h3>
      <textarea
        rows="6"
        cols="50"
        placeholder="Paste your resume text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br /><br />
      <button onClick={handleTextAnalyze}>Analyze Text</button>

      <h3>Results</h3>
      <pre style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
        {result}
      </pre>
    </div>
  );
}

export default App;
