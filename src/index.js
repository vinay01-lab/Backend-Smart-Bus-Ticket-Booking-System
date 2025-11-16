import express from "express";
import http from "http";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { pool } from "./db.js";
import busRouter from "./routes/bus.js";
import bookingRouter from "./routes/booking.js";
import seatRouter from "./routes/seat.js";
import adminRouter from "./routes/admin.js";
import tripsRouter from "./routes/trips.js";
import adminStatsRouter from "./routes/adminStats.js";
import adminAuth from "./routes/adminAuth.js";
import { fileURLToPath } from "url";
import path from "path";
import busTrackingRoute from "./routes/busTracking.js";
import reviewsRouter from "./routes/reviews.js";
import userAuth from "./routes/userAuth.js";
import authRoute from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  },
});

app.use("/api/bus", busRouter);
app.use("/api/seats", seatRouter);
app.use("/api/booking", (req, res, next) => {
  req.io = io;  // attach socket.io
  next();
}, bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/admin/stats", adminStatsRouter);
app.use("/api/admin", adminAuth);   
app.use("/api/bus-tracking", busTrackingRoute(io));
app.use("/api/reviews", reviewsRouter);
app.use("/api/auth", userAuth);
app.use("/api/auth", authRoute);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("seat_update", (data) => {
    io.emit("seat_update", data);
  });

  socket.on("booking_update", (data) => {
    io.emit("booking_update", data);
  });

  socket.on("bus_location_update", (data) => {
    io.emit("bus_location_update", data);
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});