
import axios from "axios";
import { useState } from "react";

function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState("");
  const [version, setVersion] = useState(1);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); 
    formData.append("tags", tags);
    formData.append("version", version);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/documents/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage("✅ " + res.data.message);
      setFile(null);
      setTags("");
      setVersion(1);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed!");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            color: "#333",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Upload Document
        </h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        />

        <input
          type="text"
          placeholder="Enter tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="number"
          placeholder="Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          min="1"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleUpload}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Upload
        </button>

        {message && (
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: message.startsWith("✅") ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default DocumentUpload;


