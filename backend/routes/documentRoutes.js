
import express from "express";
import multer from "multer";
import fs from "fs";
import db from "../db.js";
import jwt from "jsonwebtoken";

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

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret);
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}


// Create document and first version (requires auth)
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    console.log("Upload route hit");
    console.log("Body:", req.body);
    console.log("File:", req.file);
  
    const { tags, title } = req.body;
    const file = req.file;
  
    if (!file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }
  
    try {
      const conn = db.promise();
      // Create logical document row
      const [docResult] = await conn.query(
        "INSERT INTO documents (title, owner_id, tags) VALUES (?, ?, ?)",
        [title || file.originalname, req.userId, tags || ""]
      );
      const documentId = docResult.insertId;
      // Version number starts at 1
      await conn.query(
        "INSERT INTO document_versions (document_id, version_number, filename, filepath, uploaded_by) VALUES (?, ?, ?, ?, ?)",
        [documentId, 1, file.originalname, file.path, req.userId]
      );
      // Give owner edit permission implicitly
      await conn.query(
        "INSERT IGNORE INTO document_permissions (document_id, user_id, permission) VALUES (?, ?, 'edit')",
        [documentId, req.userId]
      );
      res.json({ message: "✅ Document uploaded successfully", documentId, version: 1 });
    } catch (err) {
      console.log("❌ DB Error:", err);
      return res.status(500).json({ error: err.message });
    }
  });
  


// Search by title/tags; only documents user can view
router.get("/search", authMiddleware, async (req, res) => {
  const { keyword } = req.query;
  try {
    const [rows] = await db
      .promise()
      .query(
        `SELECT d.id, d.title, d.tags,
                MAX(v.version_number) AS latestVersion,
                SUBSTRING_INDEX(GROUP_CONCAT(v.filepath ORDER BY v.version_number DESC), ',', 1) AS latestFilepath,
                SUBSTRING_INDEX(GROUP_CONCAT(v.filename ORDER BY v.version_number DESC), ',', 1) AS latestFilename
         FROM documents d
         JOIN document_permissions p ON p.document_id = d.id AND p.user_id = ?
         LEFT JOIN document_versions v ON v.document_id = d.id
         WHERE d.title LIKE ? OR d.tags LIKE ?
         GROUP BY d.id, d.title, d.tags
         ORDER BY d.updated_at DESC`,
        [req.userId, `%${keyword || ""}%`, `%${keyword || ""}%`]
      );
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


// List documents current user can view
router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query(
        `SELECT d.id, d.title, d.tags,
                MAX(v.version_number) AS latestVersion,
                SUBSTRING_INDEX(GROUP_CONCAT(v.filepath ORDER BY v.version_number DESC), ',', 1) AS latestFilepath,
                SUBSTRING_INDEX(GROUP_CONCAT(v.filename ORDER BY v.version_number DESC), ',', 1) AS latestFilename
         FROM documents d
         JOIN document_permissions p ON p.document_id = d.id AND p.user_id = ?
         LEFT JOIN document_versions v ON v.document_id = d.id
         GROUP BY d.id, d.title, d.tags
         ORDER BY d.updated_at DESC`,
        [req.userId]
      );
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


// Upload a new version (requires edit permission)
router.post("/:id/versions", authMiddleware, upload.single("file"), async (req, res) => {
  const { id } = req.params; // document id
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });
  try {
    const conn = db.promise();
    const [perm] = await conn.query(
      "SELECT permission FROM document_permissions WHERE document_id = ? AND user_id = ?",
      [id, req.userId]
    );
    const hasEdit = perm.some((p) => p.permission === "edit");
    if (!hasEdit) return res.status(403).json({ message: "No edit permission" });

    const [latest] = await conn.query(
      "SELECT COALESCE(MAX(version_number),0) AS v FROM document_versions WHERE document_id = ?",
      [id]
    );
    const nextVersion = (latest[0]?.v || 0) + 1;
    await conn.query(
      "INSERT INTO document_versions (document_id, version_number, filename, filepath, uploaded_by) VALUES (?, ?, ?, ?, ?)",
      [id, nextVersion, file.originalname, file.path, req.userId]
    );
    await conn.query("UPDATE documents SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
    res.json({ message: "✅ New version uploaded", version: nextVersion });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get versions metadata; ensure view permission
router.get("/:id/versions", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const conn = db.promise();
    const [perm] = await conn.query(
      "SELECT 1 FROM document_permissions WHERE document_id = ? AND user_id = ?",
      [id, req.userId]
    );
    if (perm.length === 0) return res.status(403).json({ message: "No access" });
    const [rows] = await conn.query(
      "SELECT id, version_number, filename, filepath, created_at FROM document_versions WHERE document_id = ? ORDER BY version_number DESC",
      [id]
    );
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Share document permissions (owner/editors can grant view/edit)
router.post("/:id/share", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { userId, permission } = req.body; // 'view' or 'edit'
  if (!userId || !["view", "edit"].includes(permission)) {
    return res.status(400).json({ message: "userId and valid permission required" });
  }
  try {
    const conn = db.promise();
    const [perm] = await conn.query(
      "SELECT permission FROM document_permissions WHERE document_id = ? AND user_id = ?",
      [id, req.userId]
    );
    const canGrant = perm.some((p) => p.permission === "edit");
    if (!canGrant) return res.status(403).json({ message: "No permission to share" });
    await conn.query(
      "INSERT INTO document_permissions (document_id, user_id, permission) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permission = VALUES(permission)",
      [id, userId, permission]
    );
    res.json({ message: "✅ Permission updated" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
