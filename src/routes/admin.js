import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ADD BUS
router.post("/add-bus", async (req, res) => {
  const { bus_no, total_seats } = req.body;

  try {
    await pool.query(
      "INSERT INTO buses (bus_no, total_seats) VALUES ($1, $2)",
      [bus_no, total_seats]
    );

    res.json({ message: "Bus added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD TRIP
router.post("/add-trip", async (req, res) => {
  const { bus_id, route, date, time, fare } = req.body;

  try {
    const trip = await pool.query(
      "INSERT INTO trips (bus_id, route, date, time, fare) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [bus_id, route, date, time, fare]
    );

    // Add seats for the new trip
    const tripId = trip.rows[0].id;
    for (let i = 1; i <= 40; i++) {
      await pool.query(
        "INSERT INTO seats (trip_id, seat_no) VALUES ($1, $2)",
        [tripId, i]
      );
    }

    res.json({ message: "Trip added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
