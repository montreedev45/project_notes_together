import Plan from "./plan.model.js";

export const getPlan = async (req, res) => {
  try {
    const plans = await Plan.find()
    .select("_id plan price description")

    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "fetch plan failed" });
  }
};


