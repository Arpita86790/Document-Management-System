import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function RegisterPage({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API}/api/auth/register`, { name, email, password });
      onRegister?.(res.data.token);
    } catch (err) {
      setError("Registration failed");
    }
  }

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
      <form onSubmit={handleSubmit} style={{ width: 360, padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
        <h2>Create account</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
          <input placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button type="submit">Register</button>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <div>Already have an account? <Link to="/login">Login</Link></div>
        </div>
      </form>
    </div>
  );
}
