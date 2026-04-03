import React, { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeText = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("YOUR_BACKEND_API_URL/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      setResult("Error analyzing text");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>AI Resume Analyzer</h1>
      <p className="subtitle">
        Optimize your resume for ATS and recruiters
      </p>

      <div className="card">
        <textarea
          placeholder="Paste your resume text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={analyzeText}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>

      <div className="card result">
        <h2>Results</h2>
        <pre>{result}</pre>
      </div>
    </div>
  );
}

export default App;
