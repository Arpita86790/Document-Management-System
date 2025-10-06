
import express from "express";
import multer from "multer";
import fs from "fs";
import db from "../db.js";

const router = express.Router();


const dir = "uploads";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });


router.post("/upload", upload.single("file"), (req, res) => {
    console.log("Upload route hit");
    console.log("Body:", req.body);
    console.log("File:", req.file);
  
    const { tags, version } = req.body;
    const file = req.file;
  
    if (!file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }
  
    const query =
      "INSERT INTO documents (filename, filepath, tags, version) VALUES (?, ?, ?, ?)";
    db.query(query, [file.originalname, file.path, tags || "", version || 1], (err) => {
      if (err) {
        console.log("❌ DB Error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "✅ Document uploaded successfully" });
    });
  });
  


router.get("/search", (req, res) => {
  const { keyword } = req.query;
  const searchQuery = "SELECT * FROM documents WHERE tags LIKE ? OR filename LIKE ?";
  db.query(searchQuery, [`%${keyword}%`, `%${keyword}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


router.get("/", (req, res) => {
  db.query("SELECT * FROM documents", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


router.put("/update-version/:id", (req, res) => {
  const { id } = req.params;
  const { version } = req.body;

  const updateQuery = "UPDATE documents SET version = ? WHERE id = ?";
  db.query(updateQuery, [version, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "✅ Document version updated" });
  });
});

export default router;
