import Notification from "./notification.model.js";

export const getNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    const allNotic = await Notification.find({ recipient: userId })
      .populate("sender", "username email avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(allNotic);
  } catch (error) {
    console.error("❌ Fetch notification error:", error);
    res.status(500).json({ message: "fetch notification failed" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } },
    );

    res.status(200).json({ message: "Mark as read successfully" });
  } catch (error) {
    console.error("❌ Mark as read error:", error);
    res.status(500).json({ message: "Unexpected response from server" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const noticId = req.params.noticId;
    const userId = req.user._id;

    const deletedNotice = await Notification.findOneAndDelete({
      _id: noticId,
      recipient: userId,
    });

    if (!deletedNotice) {
      return res
        .status(404)
        .json({ message: "Notification not found or unauthorized" });
    }

    res.status(200).json({ message: "Delete notification successfully" });
  } catch (error) {
    console.error("❌ Delete notification error:", error);
    res.status(500).json({ message: "Unexpected response from server" });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({
      recipient: userId,
    });

    res.status(200).json({ message: "Clear all notifications successfully" });
  } catch (error) {
    console.error("❌ Delete all notifications error:", error);
    res.status(500).json({ message: "Unexpected response from server" });
  }
};
