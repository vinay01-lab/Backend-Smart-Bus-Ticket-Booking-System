import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET seats for a trip (used by SeatMap)
router.get("/:tripId/seats", async (req, res) => {
  const { tripId } = req.params;

  try {
    const result = await pool.query(
      "SELECT seat_no, status, seat_type, base_fare FROM seats WHERE trip_id = $1 ORDER BY seat_no ASC",
      [tripId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
