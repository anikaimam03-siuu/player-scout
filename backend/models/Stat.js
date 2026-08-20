import mongoose from "mongoose";

const statSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  season: { type: String, required: true }, // e.g. "2025/26"
  minutesPlayed: { type: Number, default: 0 },
  values: {
    type: Map,
    of: Number,
    required: true,
    
  },
});

statSchema.index({ player: 1, season: 1 }, { unique: true });

export default mongoose.model("Stat", statSchema);
