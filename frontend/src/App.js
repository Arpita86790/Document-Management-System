import React from "react";
import UploadDocument from "./components/UploadDocument";
import DocumentList from "./components/DocumentList";
import SearchDocument from "./components/SearchDocument";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import { useEffect, useState } from "react";

function getToken() {
  return localStorage.getItem("token");
}

function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [token, setToken] = useState(getToken());
  useEffect(() => {
    const onStorage = () => setToken(getToken());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <BrowserRouter>
      <div className="container" style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1>📂 Document Management System</h1>
        {token && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={() => { localStorage.removeItem("token"); setToken(null); }}>
              Logout
            </button>
          </div>
        )}
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={(t)=>{localStorage.setItem("token", t); setToken(t);}} />} />
          <Route path="/register" element={<RegisterPage onRegister={(t)=>{localStorage.setItem("token", t); setToken(t);}} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <UploadDocument />
                  <SearchDocument />
                  <DocumentList />
                </>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
