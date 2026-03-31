import { useState } from "react";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // TEXT ANALYSIS
  const handleAnalyze = async () => {
    setLoading(true);

    const res = await fetch("https://resume-analyzer-backend-9dde.onrender.com/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resumeText }),
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  // PDF ANALYSIS
  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF");

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);

    const res = await fetch("https://resume-analyzer-backend-9dde.onrender.com/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>AI Resume Analyzer 🚀</h1>

      {/* TEXT SECTION */}
      <h3>Paste Resume</h3>
      <textarea
        rows="8"
        cols="60"
        placeholder="Paste your resume here..."
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />

      <br /><br />
      <button onClick={handleAnalyze}>Analyze Text</button>

      <hr />

      {/* PDF SECTION */}
      <h3>Upload PDF Resume</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br /><br />
      <button onClick={handleUpload}>Analyze PDF</button>

      <hr />

      {/* RESULT */}
      <h2>Result:</h2>

      {loading ? (
        <p>Analyzing... ⏳</p>
      ) : (
        <p>{result}</p>
      )}
    </div>
  );
}

export default App;
