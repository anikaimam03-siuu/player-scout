import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  club: { type: String, required: true },
  nationality: { type: String },
  age: { type: Number },
  position: {
    type: String,
    enum: ["GK", "DEF", "MID", "FWD"],
    required: true,
  },
  
  role: { type: String, required: true },
});

export default mongoose.model("Player", playerSchema);
