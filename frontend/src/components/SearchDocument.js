import React, { useState } from "react";
import axios from "axios";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SearchDocument = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/api/documents/search?keyword=${encodeURIComponent(keyword)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setResults(res.data);
  };

  return (
    <div>
      <h2>Search Documents</h2>
      <input placeholder="Enter keyword..." onChange={e => setKeyword(e.target.value)} />
      <button onClick={handleSearch}>Search</button>

      <ul>
        {results.map(doc => (
          <li key={doc.id}>
            {doc.title} — Tags: {doc.tags} — v{doc.latestVersion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchDocument;
