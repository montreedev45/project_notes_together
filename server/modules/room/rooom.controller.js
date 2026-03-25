import Room from "./room.model.js";

//create room
export const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;

    const room = await Room.create({
      name,
      description,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
        },
      ],
    });

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "create room failed" });
  }
};

//get my room
export const getMyRooms = async (req, res) => {
  try {
    const room = await Room.find({
      "members.user": req.user._id,
    }).populate("owner", "username email");

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "fecth rooms failed" });
  }
};

//get room by id
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "members.user",
      "username email",
    );

    if (!room) {
      res.status(404).json({ message: "room not found" });
    }

    //check member
    const isMember = room.members.some(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      res.status(403).json({ message: "access denied" });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "fetch room failed" });
  }
};

//join room
export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findById(roomId)
    if (!room) {
      res.status(404).json({ message: "room not found" });
    }

    const alreadyMember = room.members.some(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );
    if (alreadyMember) {
      return res.json(room);
    }

    room.members.push({
      user: req.user._id,
      role: "editor",
    });

    await room.save();

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "join room failed" });
  }
};
