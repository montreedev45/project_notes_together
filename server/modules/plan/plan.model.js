import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  plan: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  description: {
    type: [String], 
    default: [],
  },
  roomLimit: {
    type: Number, 
    required: true,
    default: 3,
  },
  colleagueLimit: {
    type: Number, 
    required: true,
    default: 1,
  }
}, { timestamps: true }); 

const Plan = mongoose.model("Plan", planSchema);
export default Plan;