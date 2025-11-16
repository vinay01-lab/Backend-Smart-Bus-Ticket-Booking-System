import express from "express";
import cors from "cors";
import adminAuth from "./src/routes/adminAuth.js";
import busRoutes from "./src/routes/bus.js";
import tripRoutes from "./src/routes/trips.js";
import bookingRoutes from "./src/routes/booking.js";
import adminStats from "./src/routes/adminStats.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------
// ROUTES
// ----------------------
app.use("/api/admin", adminAuth);      // ✅ THIS CREATES /api/admin/login
app.use("/api/bus", busRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/admin/stats", adminStats);

// ----------------------
// TEST ROUTE
// ----------------------
app.get("/", (req, res) => {
  res.send("Smart Bus API Running...");
});

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
