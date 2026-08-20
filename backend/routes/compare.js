import express from "express";
import Player from "../models/Player.js";
import Stat from "../models/Stat.js";
import RoleWeighting from "../models/RoleWeighting.js";

const router = express.Router();

// Turn a raw value into a percentage  against a reference pool of values.
function percentile(value, pool) {
  if (!pool.length) return 50;
  const below = pool.filter((v) => v <= value).length;
  return Math.round((below / pool.length) * 100);
}


function readValue(values, key) {
  if (!values) return undefined;
  if (typeof values.get === "function") return values.get(key);
  return values[key];
}

router.get("/", async (req, res) => {
  try {
    const { player1, player2, role } = req.query;
    if (!player1 || !player2) {
      return res.status(400).json({ error: "player1 and player2 query params are required" });
    }

    const [p1, p2] = await Promise.all([Player.findById(player1), Player.findById(player2)]);
    if (!p1 || !p2) return res.status(404).json({ error: "One or both players not found" });

    const roleName = role || p1.role;
    const roleWeighting = await RoleWeighting.findOne({ role: roleName });
    if (!roleWeighting) {
      return res.status(404).json({ error: `No stat weighting defined for role "${roleName}"` });
    }

    const [s1, s2] = await Promise.all([
      Stat.findOne({ player: p1._id }).sort({ season: -1 }),
      Stat.findOne({ player: p2._id }).sort({ season: -1 }),
    ]);
    if (!s1 || !s2) return res.status(404).json({ error: "Missing stat line for one or both players" });

    const statKeys = [...roleWeighting.weights.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([key]) => key);

    const peers = await Player.find({ position: roleWeighting.position }, "_id");
    const peerStats = await Stat.aggregate([
      { $match: { player: { $in: peers.map((p) => p._id) } } },
      { $sort: { season: -1 } },
      { $group: { _id: "$player", doc: { $first: "$$ROOT" } } },
    ]);

    const radar = [];
    let score1 = 0;
    let score2 = 0;
    let weightSum = 0;

    for (const key of statKeys) {
      const pool = peerStats
        .map((p) => readValue(p.doc.values, key))
        .filter((v) => v !== undefined && v !== null);

      const raw1 = readValue(s1.values, key) ?? 0;
      const raw2 = readValue(s2.values, key) ?? 0;
      const pct1 = percentile(raw1, pool);
      const pct2 = percentile(raw2, pool);
      const weight = roleWeighting.weights.get(key) ?? 0;

      score1 += pct1 * weight;
      score2 += pct2 * weight;
      weightSum += weight;

      radar.push({
        stat: key,
        weight,
        [p1.name]: pct1,
        [p2.name]: pct2,
        [`${p1.name}_raw`]: raw1,
        [`${p2.name}_raw`]: raw2,
      });
    }

    res.json({
      role: roleWeighting.role,
      position: roleWeighting.position,
      player1: { ...p1.toObject(), season: s1.season, roleScore: Math.round(score1 / (weightSum || 1)) },
      player2: { ...p2.toObject(), season: s2.season, roleScore: Math.round(score2 / (weightSum || 1)) },
      radar,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;