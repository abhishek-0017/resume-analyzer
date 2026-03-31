import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const BASE_URL = "https://your-backend.onrender.com"; // 🔥 REPLACE THIS

  useEffect(() => {
    if (!user) navigate("/");

    axios.get(`${BASE_URL}/api/history/${user.email}`)
      .then(res => setHistory(res.data))
      .catch(err => console.log(err));

  }, []);

  const handleAnalyze = async () => {
    if (!file) {
      alert("Upload resume first ❗");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("email", user.email);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/analyze`,
        formData
      );

      setResult(res.data);

      const historyRes = await axios.get(
        `${BASE_URL}/api/history/${user.email}`
      );
      setHistory(historyRes.data);

    } catch (err) {
      alert("Analysis failed ❌");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Welcome {user?.name} 👋</h2>

      <div style={cardStyle}>
        <h3>Upload Resume</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <br /><br />
        <button onClick={handleAnalyze}>Analyze Resume</button>
      </div>

      {result && (
        <div style={cardStyle}>
          <h2>ATS Score: {result.score}%</h2>

          <h3>Matched Skills</h3>
          {result.matched.map((s, i) => <span key={i} style={tagGreen}>{s}</span>)}

          <h3>Missing Skills</h3>
          {result.missing.map((s, i) => <span key={i} style={tagRed}>{s}</span>)}

          <h3>AI Feedback</h3>
          <p><b>Summary:</b> {result.feedback.summary}</p>

          {result.feedback.strengths.map((s, i) => <p key={i}>💪 {s}</p>)}
          {result.feedback.weaknesses.map((w, i) => <p key={i}>⚠ {w}</p>)}
          {result.feedback.suggestions.map((s, i) => <p key={i}>💡 {s}</p>)}
        </div>
      )}

      <div style={cardStyle}>
        <h3>Previous Analyses</h3>

        {history.map((item, i) => (
          <div key={i}>
            <p><b>Score:</b> {item.score}%</p>
            <p><b>Date:</b> {new Date(item.createdAt).toLocaleString()}</p>
            <hr />
          </div>
        ))}
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

const cardStyle = {
  background: "#f9f9f9",
  padding: "20px",
  margin: "20px 0",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const tagGreen = {
  background: "#d4edda",
  padding: "5px 10px",
  margin: "5px",
  display: "inline-block",
  borderRadius: "5px"
};

const tagRed = {
  background: "#f8d7da",
  padding: "5px 10px",
  margin: "5px",
  display: "inline-block",
  borderRadius: "5px"
};

export default Dashboard;