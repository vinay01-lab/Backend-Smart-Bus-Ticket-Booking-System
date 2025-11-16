import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, bus_no, total_seats FROM buses ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE BUS (prevent delete if trips exist)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if bus is used in any trip
    const check = await pool.query(
      "SELECT COUNT(*) FROM trips WHERE bus_id = $1",
      [id]
    );

    if (check.rows[0].count > 0) {
      return res.status(400).json({
        error: "Cannot delete bus. It has assigned trips."
      });
    }

    // Safe to delete
    await pool.query("DELETE FROM buses WHERE id = $1", [id]);

    res.json({ message: "Bus deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
