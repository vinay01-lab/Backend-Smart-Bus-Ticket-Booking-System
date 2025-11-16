import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashed]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (result.rows.length === 0)
    return res.status(401).json({ error: "Invalid email or password" });

  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ error: "Invalid email or password" });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user });
});

export default router;
