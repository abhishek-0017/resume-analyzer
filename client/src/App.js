import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState("");

  const BACKEND_URL = "https://resume-analyzer-backend-9dde.onrender.com";

  /* ---------- PDF ---------- */
  const handleFileUpload = async () => {
    if (!file) return alert("Upload PDF");

    const formData = new FormData();
    formData.append("file", file);

    setResult("Analyzing PDF... ⏳");

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setResult(
        `Score: ${data.analysis.score}

Suggestions:
- ${data.analysis.suggestions.join("\n- ")}

Best Job Matches:
${data.jobs.map(j => `- ${j.role} (${j.match}%)`).join("\n")}`
      );
    } catch {
      setResult("Error ❌");
    }
  };

  /* ---------- TEXT ---------- */
  const handleTextAnalyze = async () => {
    setResult("Analyzing Text... ⏳");

    try {
      const res = await fetch(`${BACKEND_URL}/analyze-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });

      const data = await res.json();

      setResult(
        `Score: ${data.analysis.score}

Suggestions:
- ${data.analysis.suggestions.join("\n- ")}

Best Job Matches:
${data.jobs.map(j => `- ${j.role} (${j.match}%)`).join("\n")}`
      );
    } catch {
      setResult("Error ❌");
    }
  };

  /* ---------- REWRITE ---------- */
  const handleRewrite = async () => {
    setResult("Improving Resume... ⏳");

    try {
      const res = await fetch(`${BACKEND_URL}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });

      const data = await res.json();

      setResult(data.analysis);
    } catch {
      setResult("Error ❌");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🚀 AI Resume Analyzer</h1>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br />
      <button onClick={handleFileUpload}>Analyze PDF</button>

      <hr />

      <textarea
        rows="6"
        cols="50"
        placeholder="Paste resume text..."
        onChange={(e) => setResumeText(e.target.value)}
      ></textarea>
      <br />

      <button onClick={handleTextAnalyze}>Analyze Text</button>
      <button onClick={handleRewrite}>Improve Resume 🚀</button>

      <hr />

      <pre>{result}</pre>
    </div>
  );
}

export default App;
