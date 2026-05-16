import Notification from "./notification.model.js";

export const getNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    const allNotic = await Notification.find({ recipient: userId })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(allNotic);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "fetch notification failed" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } },
    );

    console.log("result", result);

    res.status(200).json({ message: "Mark as read successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unexpected response from server" });
  }
};
