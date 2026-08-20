import mongoose from "mongoose";


const roleWeightingSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true }, // e.g. "Inverted Winger"
  position: { type: String, enum: ["GK", "DEF", "MID", "FWD"], required: true },
  description: { type: String },
  weights: {
    type: Map,
    of: Number, // 0-1, should roughly sum to 1 across a role's stat keys
    required: true,
  },
});

export default mongoose.model("RoleWeighting", roleWeightingSchema);
