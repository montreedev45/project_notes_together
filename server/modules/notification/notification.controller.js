import Notification from "./notification.model.js";

export const getNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    const allNotic = await Notification.find({ recipient: userId })
      .populate("sender", "username email avatar")
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

    res.status(200).json({ message: "Mark as read successfully" });
  } catch (error) {
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
    res.status(500).json({ message: "Unexpected response from server" });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const deleteAllNotic = await Notification.deleteMany({
      recipient: userId,
    });
    if (!deleteAllNotic) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({message: "Delete all notifications succesfully"})
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Unexpected response from server"})
  }
};
