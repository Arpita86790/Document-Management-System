import React, { useEffect, useState } from "react";
import axios from "axios";

const DocumentList = () => {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/documents").then(res => setDocs(res.data));
  }, []);

  return (
    <div>
      <h2>All Documents</h2>
      <ul>
        {docs.map(doc => (
          <li key={doc.id}>
            <a href={`http://localhost:5000/${doc.filePath}`} target="_blank" rel="noreferrer">
              {doc.title}
            </a>
            {" — "}
            Tags: {doc.tags} | Version: {doc.version}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;
