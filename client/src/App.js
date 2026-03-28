import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("resume", file);

    const res = await axios.post("http://localhost:5000/upload", formData);
    setResult(res.data);
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🚀 ATS Resume Analyzer</h1>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={handleUpload}>Upload Resume</button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          
          <h2>ATS Score: {result.atsScore}%</h2>

          {/* Progress Bar */}
          <div style={{
            width: "100%",
            background: "#ddd",
            height: "20px",
            borderRadius: "10px"
          }}>
            <div style={{
              width: `${result.atsScore}%`,
              background: "green",
              height: "100%",
              borderRadius: "10px"
            }}></div>
          </div>

          <h3 style={{ color: "green" }}>Matched Skills</h3>
          {result.matchedKeywords.map((s, i) => <p key={i}>✔ {s}</p>)}

          <h3 style={{ color: "red" }}>Missing Skills</h3>
          {result.missingKeywords.map((s, i) => <p key={i}>❌ {s}</p>)}

          <h3>Suggestions</h3>
          {result.suggestions.map((s, i) => <p key={i}>💡 {s}</p>)}

          <h3>🤖 AI Feedback</h3>
          <div style={{ background: "#f4f4f4", padding: "10px" }}>
            {result.aiAnalysis}
          </div>

          <br />
          <a href={`http://localhost:5000/download/${result.id}`}>
            Download Report 📄
          </a>

        </div>
      )}
    </div>
  );
}

export default App;
