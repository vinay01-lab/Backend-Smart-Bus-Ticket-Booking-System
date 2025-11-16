import express from "express";
import { pool } from "../db.js";

export default function busTrackingRoute(io) {
  const router = express.Router();

  // Driver updates bus location
  router.post("/update-location", async (req, res) => {
    const { bus_id, lat, lng } = req.body;

    await pool.query(
      "UPDATE buses SET lat=$1, lng=$2 WHERE id=$3",
      [lat, lng, bus_id]
    );

    // notify ALL clients
    io.emit("bus_location_update", { bus_id, lat, lng });

    res.json({ success: true });
  });

  // get current location
  router.get("/:bus_id/location", async (req, res) => {
    const bus_id = req.params.bus_id;

    const result = await pool.query(
      "SELECT lat, lng FROM buses WHERE id=$1",
      [bus_id]
    );

    res.json(result.rows[0] || {});
  });

  return router;
}
