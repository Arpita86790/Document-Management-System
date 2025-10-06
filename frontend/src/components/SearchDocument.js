import React, { useState } from "react";
import axios from "axios";

const SearchDocument = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const res = await axios.get(`http://localhost:5000/api/documents/search?keyword=${keyword}`);
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
            {doc.title} — Tags: {doc.tags}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchDocument;
