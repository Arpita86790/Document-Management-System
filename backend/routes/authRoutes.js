import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

function generateToken(userId) {
  const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, and password are required" });
  }

  try {
    const [existing] = await db.promise().query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db
      .promise()
      .query("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [name, email, passwordHash]);

    const token = generateToken(result.insertId);
    return res.status(201).json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const [rows] = await db.promise().query("SELECT id, password_hash FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user.id);
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
});

router.get("/me", async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret);
    const [rows] = await db.promise().query("SELECT id, name, email FROM users WHERE id = ?", [payload.userId]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    return res.json(rows[0]);
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
// Lookup user by email for sharing convenience
router.get("/users/by-email", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "email is required" });
  try {
    const [rows] = await db.promise().query("SELECT id, name, email FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ message: "Lookup failed", error: e.message });
  }
});
