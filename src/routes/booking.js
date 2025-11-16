import express from "express";
import { pool } from "../db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Create booking
router.post("/", authMiddleware, async (req, res) => {
  const { trip_id, seat_no, fare } = req.body;
  const user_id = req.user.id; // comes from JWT

  try {
    // 1. Check if seat already booked
    const seatCheck = await pool.query(
      "SELECT * FROM bookings WHERE trip_id=$1 AND seat_no=$2",
      [trip_id, seat_no]
    );

    if (seatCheck.rows.length > 0)
      return res.status(400).json({ error: "Seat already booked" });

    // 2. Insert booking
    const result = await pool.query(
      `INSERT INTO bookings (user_id, trip_id, seat_no, fare)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, trip_id, seat_no, fare]
    );

    // 3. Update seat status
    await pool.query(
      `UPDATE seats SET status='booked' 
       WHERE trip_id=$1 AND seat_no=$2`,
      [trip_id, seat_no]
    );

    // 4. Emit socket event
    req.io.emit("seat_update", {
      trip_id,
      seat_no,
      status: "booked",
    });

    res.json({
      success: true,
      booking: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all bookings for a user
router.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT b.*, t.route, t.date, t.time
       FROM bookings b
       JOIN trips t ON b.trip_id = t.id
       WHERE b.user_id = $1
       ORDER BY b.id DESC`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
