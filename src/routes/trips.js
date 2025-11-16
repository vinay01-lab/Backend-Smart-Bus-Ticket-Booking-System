import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { from, to, date } = req.query;

  let query = `
    SELECT 
      trips.id AS trip_id,
      buses.bus_no,
      buses.id AS bus_id,
      trips.route,
      TO_CHAR(trips.date, 'DD-Mon-YYYY') AS date,
      TO_CHAR(trips.time, 'HH24:MI') AS time,
      trips.fare
    FROM trips
    JOIN buses ON trips.bus_id = buses.id
  `;

  let conditions = [];
  let values = [];

  if (from) {
    conditions.push(`LOWER(trips.route) LIKE LOWER($${conditions.length + 1})`);
    values.push(`${from}%`);
  }

  if (to) {
    conditions.push(`LOWER(trips.route) LIKE LOWER($${conditions.length + 1})`);
    values.push(`%${to}`);
  }

  if (date) {
    conditions.push(`trips.date = $${conditions.length + 1}`);
    values.push(date);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY trips.id ASC";

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE TRIP
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // delete seats first to avoid foreign key errors
    await pool.query("DELETE FROM seats WHERE trip_id = $1", [id]);

    // delete the trip
    await pool.query("DELETE FROM trips WHERE id = $1", [id]);

    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE TRIP
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { route, date, time, fare } = req.body;

  try {
    await pool.query(
      `
      UPDATE trips 
      SET route = $1, date = $2, time = $3, fare = $4 
      WHERE id = $5
      `,
      [route, date, time, fare, id]
    );

    res.json({ message: "Trip updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get single trip details
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        trips.id AS trip_id,
        buses.bus_no,
        buses.id AS bus_id,
        trips.route,
        TO_CHAR(trips.date, 'YYYY-MM-DD') AS date,
        TO_CHAR(trips.time, 'HH24:MI') AS time,
        trips.fare
      FROM trips
      JOIN buses ON trips.bus_id = buses.id
      WHERE trips.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET trip occupancy (booked vs total seats)
router.get("/:id/occupancy", async (req, res) => {
  const { id } = req.params;

  try {
    const total = await pool.query(
      "SELECT total_seats FROM buses WHERE id = (SELECT bus_id FROM trips WHERE id = $1)",
      [id]
    );

    const booked = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE trip_id = $1",
      [id]
    );

    res.json({
      total_seats: Number(total.rows[0]?.total_seats || 0),
      booked_seats: Number(booked.rows[0]?.count || 0),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;