import React, { useEffect, useState } from "react";
import axios from "axios";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DocumentList = () => {
  const [docs, setDocs] = useState([]);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePerm, setSharePerm] = useState("view");
  const [selectedDocId, setSelectedDocId] = useState(null);

  async function shareDocument(docId) {
    const token = localStorage.getItem("token");
    if (!shareEmail) return;
    try {
      const userRes = await axios.get(`${API}/api/auth/users/by-email?email=${encodeURIComponent(shareEmail)}`);
      const userId = userRes.data.id;
      await axios.post(`${API}/api/documents/${docId}/share`, { userId, permission: sharePerm }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Permission updated");
      setSelectedDocId(null);
      setShareEmail("");
      setSharePerm("view");
    } catch (e) {
      alert("Failed to share: " + (e.response?.data?.message || e.message));
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API}/api/documents`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setDocs(res.data));
  }, []);

  return (
    <div>
      <h2>All Documents</h2>
      <ul>
        {docs.map(doc => (
          <li key={doc.id}>
            <a href={`${API}/${doc.latestFilepath || ''}`} target="_blank" rel="noreferrer">
              {doc.title}
            </a>
            {" — "}
            Tags: {doc.tags} | Latest Version: {doc.latestVersion}
            {" "}
            <button style={{ marginLeft: 8 }} onClick={() => setSelectedDocId(doc.id)}>Share</button>
            {selectedDocId === doc.id && (
              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <input placeholder="User email" value={shareEmail} onChange={(e)=>setShareEmail(e.target.value)} />
                <select value={sharePerm} onChange={(e)=>setSharePerm(e.target.value)}>
                  <option value="view">View</option>
                  <option value="edit">Edit</option>
                </select>
                <button onClick={() => shareDocument(doc.id)}>Grant</button>
                <button onClick={() => setSelectedDocId(null)}>Cancel</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;
