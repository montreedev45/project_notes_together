import { generateToken } from "../auth/auth.controller.js";
import User from "../auth/auth.model.js";
import Plan from "./plan.model.js";

export const getPlan = async (req, res) => {
  try {
    const plans = await Plan.find();

    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "fetch plan failed" });
  }
};


