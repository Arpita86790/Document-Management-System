import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      onLogin?.(res.data.token);
    } catch (err) {
      setError("Invalid credentials");
    }
  }

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
      <form onSubmit={handleSubmit} style={{ width: 360, padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
        <h2>Login</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <input placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button type="submit">Sign in</button>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <div>New here? <Link to="/register">Create account</Link></div>
        </div>
      </form>
    </div>
  );
}
