import express from "express";
import Player from "../models/Player.js";
import Stat from "../models/Stat.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const { position, role, search } = req.query;
    const filter = {};
    if (position) filter.position = position;
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: "i" };

    const players = await Player.find(filter).sort({ name: 1 });
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Player not found" });

    const stat = await Stat.findOne({ player: player._id }).sort({ season: -1 });
    res.json({ player, stat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/players  -> create a player
router.post("/", async (req, res) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json(player);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/players/:id/stats -> add/update a season's stat line
router.post("/:id/stats", async (req, res) => {
  try {
    const { season, minutesPlayed, values } = req.body;
    const stat = await Stat.findOneAndUpdate(
      { player: req.params.id, season },
      { player: req.params.id, season, minutesPlayed, values },
      { upsert: true, new: true }
    );
    res.status(201).json(stat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
