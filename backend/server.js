import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import playerRoutes from "./routes/players.js";
import roleRoutes from "./routes/roles.js";
import compareRoutes from "./routes/compare.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/players", playerRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/compare", compareRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/player-scout";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
