import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState("");

  const BACKEND_URL = "https://resume-analyzer-backend-9dde.onrender.com";

  const handleFileUpload = async () => {
    if (!file) return alert("Upload PDF");

    const formData = new FormData();
    formData.append("file", file);

    setResult("Analyzing PDF... ⏳");

    const res = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setResult(
      `Score: ${data.analysis.score}

Suggestions:
${data.analysis.suggestions.length > 0
  ? data.analysis.suggestions.map(s => `- ${s}`).join("\n")
  : "No major issues found 🎉"}

Best Job Matches:
${data.jobs.map(j => `- ${j.role} (${j.match}%)`).join("\n")}`
    );
  };

  const handleTextAnalyze = async () => {
    setResult("Analyzing Text... ⏳");

    const res = await fetch(`${BACKEND_URL}/analyze-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: resumeText }),
    });

    const data = await res.json();

    setResult(
      `Score: ${data.analysis.score}

Suggestions:
${data.analysis.suggestions.length > 0
  ? data.analysis.suggestions.map(s => `- ${s}`).join("\n")
  : "No major issues found 🎉"}

Best Job Matches:
${data.jobs.map(j => `- ${j.role} (${j.match}%)`).join("\n")}`
    );
  };

  const handleRewrite = async () => {
    setResult("Improving Resume... ⏳");

    const res = await fetch(`${BACKEND_URL}/rewrite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: resumeText }),
    });

    const data = await res.json();

    setResult(data.analysis);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚀 AI Resume Analyzer</h1>

      <div style={styles.grid}>
        
        {/* LEFT PANEL */}
        <div style={styles.card}>
          <h2>Upload Resume</h2>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button style={styles.button} onClick={handleFileUpload}>
            Analyze PDF
          </button>

          <hr />

          <textarea
            rows="6"
            placeholder="Paste resume text..."
            style={styles.textarea}
            onChange={(e) => setResumeText(e.target.value)}
          ></textarea>

          <div>
            <button style={styles.buttonGreen} onClick={handleTextAnalyze}>
              Analyze Text
            </button>

            <button style={styles.buttonPurple} onClick={handleRewrite}>
              Improve Resume
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.card}>
          <h2>Results</h2>
          <pre style={styles.result}>{result}</pre>
        </div>

      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
  },
  title: {
    textAlign: "center",
  },
  grid: {
    display: "flex",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    flex: 1,
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
  },
  button: {
    display: "block",
    marginTop: "10px",
    padding: "10px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonGreen: {
    marginTop: "10px",
    marginRight: "10px",
    padding: "10px",
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
  },
  buttonPurple: {
    marginTop: "10px",
    padding: "10px",
    background: "purple",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
  },
  result: {
    whiteSpace: "pre-wrap",
  },
};

export default App;
