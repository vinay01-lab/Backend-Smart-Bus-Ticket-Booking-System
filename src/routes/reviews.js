import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// get reviews for a trip
router.get("/:tripId", async (req, res) => {
  const { tripId } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, rating, comment, created_at FROM reviews WHERE trip_id = $1 ORDER BY created_at DESC",
      [tripId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add review
router.post("/:tripId", async (req, res) => {
  const { tripId } = req.params;
  const { rating, comment } = req.body;

  try {
    await pool.query(
      "INSERT INTO reviews (trip_id, rating, comment) VALUES ($1,$2,$3)",
      [tripId, rating, comment]
    );
    res.json({ message: "Review added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
