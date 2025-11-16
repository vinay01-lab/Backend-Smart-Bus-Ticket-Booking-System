import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// total buses
router.get("/bus-count", async (req, res) => {
  const result = await pool.query("SELECT COUNT(*) AS count FROM buses");
  res.json(result.rows[0]);
});

// total trips
router.get("/trip-count", async (req, res) => {
  const result = await pool.query("SELECT COUNT(*) AS count FROM trips");
  res.json(result.rows[0]);
});

// total bookings
router.get("/booking-count", async (req, res) => {
  const result = await pool.query("SELECT COUNT(*) AS count FROM bookings");
  res.json(result.rows[0]);
});

// today's trips
router.get("/today-trips", async (req, res) => {
  const result = await pool.query(`
    SELECT COUNT(*) AS count
    FROM trips 
    WHERE date = CURRENT_DATE
  `);
  res.json(result.rows[0]);
});

// trips per day (last 7 days)
router.get("/trips-per-day", async (req, res) => {
  const result = await pool.query(`
    SELECT date::text AS date, COUNT(*) AS count
    FROM trips
    WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY date
    ORDER BY date ASC
  `);
  res.json(result.rows);
});

// bookings per route
router.get("/bookings-per-route", async (req, res) => {
  const result = await pool.query(`
    SELECT trips.route AS route, COUNT(bookings.id) AS count
    FROM bookings
    JOIN trips ON bookings.trip_id = trips.id
    GROUP BY trips.route
  `);
  res.json(result.rows);
});

// revenue per day
router.get("/revenue-per-day", async (req, res) => {
  const result = await pool.query(`
    SELECT date::text AS date, SUM(fare) AS revenue
    FROM trips
    GROUP BY date
    ORDER BY date ASC
  `);
  res.json(result.rows);
});

export default router;
