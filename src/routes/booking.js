import express from "express";
import { pool } from "../db.js"; // adjust import path if needed

const router = express.Router();

/**
 * POST /api/booking
 * body: { user_id, trip_id, seat_no }
 */
router.post("/", async (req, res) => {
  const { user_id, trip_id, seat_no, fare } = req.body;

  // prevent double booking
  const check = await pool.query(
    "SELECT * FROM seats WHERE trip_id=$1 AND seat_no=$2 AND status='booked'",
    [trip_id, seat_no]
  );

  if (check.rows.length > 0) {
    return res.status(400).json({ error: "Seat already booked" });
  }

  await pool.query(
    "INSERT INTO bookings (user_id, trip_id, seat_no, fare) VALUES ($1,$2,$3,$4)",
    [user_id, trip_id, seat_no, fare]
  );

  // update seat
  await pool.query(
    "UPDATE seats SET status='booked' WHERE trip_id=$1 AND seat_no=$2",
    [trip_id, seat_no]
  );

  res.json({ success: true });
});


export default router;
