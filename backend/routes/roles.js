import express from "express";
import RoleWeighting from "../models/RoleWeighting.js";

const router = express.Router();

// GET /api/roles?position=MID
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.position) filter.position = req.query.position;
    const roles = await RoleWeighting.find(filter).sort({ role: 1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/roles -> define/update a role's stat weighting
router.post("/", async (req, res) => {
  try {
    const { role, position, description, weights } = req.body;
    const roleDoc = await RoleWeighting.findOneAndUpdate(
      { role },
      { role, position, description, weights },
      { upsert: true, new: true }
    );
    res.status(201).json(roleDoc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
