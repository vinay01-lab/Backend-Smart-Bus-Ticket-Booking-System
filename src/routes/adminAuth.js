import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// LOGIN
router.post("/login", async (req, res) => {
  console.log("REQ BODY = ", req.body);
  console.log("LOGIN BODY:", req.body);
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM admin WHERE email=$1",
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const admin = result.rows[0];

  // Compare hashed password
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Create JWT
  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ success: true, token });
});

export default router;
