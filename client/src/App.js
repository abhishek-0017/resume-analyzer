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
- ${data.analysis.suggestions.join("\n- ")}

Best Job Matches:
${data.jobs.map(j => `- ${j.role} (${j.match}%)`).join("\n")}`
    );
  };

  const handleTextAnalyze = async () => {
    setResult("Analyzing Text... ⏳");

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
  };

  const handleRewrite = async () => {
    setResult("Improving Resume... ⏳");

    const res = await fetch(`${BACKEND_URL}/rewrite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: resumeText }),
    });

    const data = await res.json();

    setResult(data.analysis);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        🚀 AI Resume Analyzer
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* LEFT PANEL */}
        <div className="bg-gray-800 p-5 rounded-2xl shadow-lg">
          <h2 className="text-xl mb-4">Upload Resume</h2>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-3"
          />

          <button
            onClick={handleFileUpload}
            className="bg-blue-500 px-4 py-2 rounded-xl hover:bg-blue-600"
          >
            Analyze PDF
          </button>

          <hr className="my-4 border-gray-600" />

          <textarea
            rows="6"
            className="w-full p-2 text-black rounded"
            placeholder="Paste resume text..."
            onChange={(e) => setResumeText(e.target.value)}
          ></textarea>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleTextAnalyze}
              className="bg-green-500 px-4 py-2 rounded-xl hover:bg-green-600"
            >
              Analyze Text
            </button>

            <button
              onClick={handleRewrite}
              className="bg-purple-500 px-4 py-2 rounded-xl hover:bg-purple-600"
            >
              Improve Resume
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-gray-800 p-5 rounded-2xl shadow-lg">
          <h2 className="text-xl mb-4">Results</h2>

          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
