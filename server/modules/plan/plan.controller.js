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

export const upgradePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { planId } = req.body;

    //when use findById, it's return object { _id: "...", plan: "teams" }
    const selectedPlan = await Plan.findById(planId).select("plan");
    if (!selectedPlan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    const upgradedPlan = await User.findByIdAndUpdate(
      userId,
      { plan: selectedPlan.plan },
      { returnDocument: "after", select: "-password" } 
    );

    const newToken = generateToken(upgradedPlan);

    return res.status(200).json({ 
      success: true, 
      message: "Plan upgraded successfully", 
      newToken: newToken,
      user: upgradedPlan
    });

  } catch (error) {
    console.error("Upgrade plan error:", error);
    return res.status(500).json({ success: false, message: "Upgrade plan failed" });
  }
};
