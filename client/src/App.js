import { useState } from "react";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState("");

  const handleAnalyze = async () => {
    const res = await fetch("https://resume-analyzer-backend-9dde.onrender.com/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resumeText }),
    });

    const data = await res.json();
    setResult(data.result);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Resume Analyzer 🚀</h1>

      <textarea
        rows="10"
        cols="50"
        placeholder="Paste your resume here..."
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />

      <br /><br />

      <button onClick={handleAnalyze}>Analyze</button>

      <h2>Result:</h2>
      <p>{result}</p>
    </div>
  );
}

export default App;
