import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { createYjs } from "../lib/yjs";
import { Icon } from "@iconify/react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket, getSocket } from "../socket";
import { formatChatTime } from "../utils/formatTime";
import useAuthStore from "../store/useAuthStore";
import useRoomStore from "../store/useRoomStore";
import useCommentStore from "../store/useCommentStore";

import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import FontFamily from "@tiptap/extension-font-family";
import useNoteStore from "../store/useNoteStore";

function Editor() {
  const { roomId, role } = useParams();
  const navigate = useNavigate();

  // Stores
  const user = useAuthStore((state) => state.user);
  const getMyRooms = useRoomStore((state) => state.getMyRooms);
  const getComment = useCommentStore((state) => state.getComment);
  const myRooms = useRoomStore((state) => state.myRooms);
  const rooms = useRoomStore((state) => state.rooms);
  const onlineUsersProvider = useRoomStore(
    (state) => state.onlineUsersProvider,
  );

  // States & Refs
  const [isReady, setIsReady] = useState(false);
  const [yjs, setYjs] = useState(null);
  const providerRef = useRef(null);
  const ydocRef = useRef(null);

  // 🎯 Find Room Data
  const roomData =
    rooms.find((r) => r._id === roomId) ||
    myRooms.find((r) => r._id === roomId);

  // 🎯 1. Fetch Room & Comment Data
  useEffect(() => {
    if (!user || !roomId) return;

    let isMounted = true;

    const fetchRoomData = async () => {
      try {
        setIsReady(false);
        await Promise.all([getMyRooms(), getComment(roomId)]);
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        if (isMounted) setIsReady(true);
      }
    };

    fetchRoomData();

    return () => {
      isMounted = false;
    };
  }, [user, roomId]); // ถอด function ออกจาก dependency เพื่อกัน infinite re-render

  // 🎯 2. Permission Guard (เตะออกถ้าไม่มีสิทธิ์)
  useEffect(() => {
    if (!isReady || !user) return;

    // หาห้องไม่เจอ
    if (!roomData) {
      console.warn("This room was not found.");
      navigate("/notes-together/explore", { replace: true });
      return;
    }

    const isMember = roomData.members?.some(
      (m) => (m.user?._id || m.user) === user._id,
    );
    const isOwner = (roomData.owner?._id || roomData.owner) === user._id;
    const isPublic = !roomData.isPrivate;

    // ถ้าไม่ใช่ Member, Owner และไม่ใช่ Public Room ให้เตะออก
    if (!isMember && !isOwner && !isPublic) {
      console.warn("You do not have permission to access this room.");
      navigate("/notes-together/explore", { replace: true });
    }
  }, [isReady, roomData, user, navigate]);

  // คำนวณสิทธิ์เข้าถึงที่แท้จริง (รวม Public Room เข้าไปด้วย)
  const isMember = roomData?.members?.some(
    (m) => (m.user?._id || m.user) === user?._id,
  );
  const isOwner = (roomData?.owner?._id || roomData?.owner) === user?._id;
  const isPublic = !roomData?.isPrivate;

  // 🎯 สิทธิ์เข้าถึง = เป็นสมาชิก OR เป็นเจ้าของ OR เป็นห้อง Public
  const hasAccess = Boolean(roomData && (isMember || isOwner || isPublic));

  // 🎯 3. Socket Connection (เชื่อมต่อเมื่อเช็กสิทธิ์ผ่านแล้วเท่านั้น!)
  const socket = getSocket();
  useEffect(() => {
    if (!isReady || !hasAccess || !socket || !roomId) return;

    socket.emit("join_room", {
      roomId,
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
    });

    return () => {
      socket.emit("leave_room", { roomId });
    };
  }, [isReady, hasAccess, roomId, user, socket]);

  // 🎯 4. Yjs Provider Setup (จะสร้างเมื่อเช็กสิทธิ์ผ่านแล้วเท่านั้น!)
  useEffect(() => {
    if (!isReady || !hasAccess || !roomId) return;

    let active = true;

    const instance = createYjs(roomId, ({ ydoc, provider }) => {
      if (active) {
        setYjs(ydoc);
      }
    });

    ydocRef.current = instance.ydoc;
    providerRef.current = instance.provider;

    return () => {
      active = false;
      setYjs(null);

      if (providerRef.current) providerRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, [isReady, hasAccess, roomId]);

  // ---------------- Render Views ----------------

  // 1. กำลังเช็กสิทธิ์ และ ดึงข้อมูลห้อง
  if (!isReady || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="animate-pulse text-slate-400 font-medium">
          Checking access permissions...
        </p>
      </div>
    );
  }

  // 2. ถ้าไม่มีข้อมูล หรือไม่มีสิทธิ์เข้าห้อง (จะถูก useEffect เตะออกไปแล้ว)
  if (!roomData || !hasAccess) {
    return null;
  }

  // 3. เช็กสิทธิ์ผ่านแล้ว กำลังเชื่อมต่อ Realtime/Yjs
  if (!yjs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-slate-400 font-medium">
          Connecting to sync server...
        </div>
      </div>
    );
  }

  // 4. พร้อมใช้งาน Render Editor
  return (
    <EditorInner
      key={roomId}
      yjs={yjs}
      user={user}
      room={roomData}
      activeUsersList={onlineUsersProvider}
      provider={providerRef.current}
    />
  );
}

function ChatInput({
  value,
  onChangeText,
  onSend,
  onSendSticker,
  permissionUser,
}) {
  const [isOpenStickerModal, setIsOpenStickerModal] = useState(false);
  const getAllSticker = useCommentStore((state) => state.getAllSticker);
  const stickers = useCommentStore((state) => state.stickers);

  useEffect(() => {
    getAllSticker();
  }, []);

  return (
    <div className="relative flex items-center">
      <Icon
        icon="mdi:sticker"
        onClick={() => setIsOpenStickerModal(!isOpenStickerModal)}
        className="absolute text-primary cursor-pointer hover:text-blue-500 left-3"
        width="20"
      />

      {isOpenStickerModal && (
        <div className="absolute flex items-center  w-full p-4 bottom-14 h-26 border-2 border-slate-200 bg-slate-100 rounded-lg shadow-md">
          <div className="flex overflow-x-auto no-scrollbar w-full whitespace-nowrap">
            {stickers.map((fileName) => (
              <button
                key={fileName}
                onClick={() => onSendSticker(fileName)}
                className="shrink-0 p-1 w-18 h-18 hover:bg-blue-100 rounded-xl transition-all transform hover:scale-110 cursor-pointer mx-1"
              >
                <img
                  src={`${import.meta.env.VITE_PATH_STICKERS}?nameImg=${fileName.replace(".png", "")}`}
                  alt="sticker-option"
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        type="text"
        value={value}
        disabled={permissionUser === "viewer"}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend();
          }
        }}
        onChange={(e) => onChangeText(e)}
        className="w-full border-2 border-gray-300 rounded-lg h-10 ps-10 pe-10 outline-none"
      />
      <Icon
        icon="mdi:send"
        onClick={onSend}
        className="absolute text-primary cursor-pointer hover:text-blue-500 right-3"
        width="20"
      />
    </div>
  );
}

function EditorInner({ yjs, user, room, activeUsersList, provider }) {
  const navigate = useNavigate();
  const comments = useCommentStore((state) => state.comments);
  const addCommentFromSocket = useCommentStore(
    (state) => state.addCommentFromSocket,
  );
  const users = useAuthStore((state) => state.users);
  const getUser = useAuthStore((state) => state.getUser);
  const clearUsers = useAuthStore((state) => state.clearUsers);

  const getMyRooms = useRoomStore((state) => state.getMyRooms);
  const { role } = useParams();

  const socket = getSocket();

  const { roomId } = useParams();
  const [typedMessage, setTypedMessage] = useState("");
  //const user = useAuthStore((state) => state.user);
  const addCommentFromMe = useCommentStore((state) => state.addCommentFromMe);
  const uploadImage = useNoteStore((state) => state.uploadImage);
  const imageUrl = useNoteStore((state) => state.imageUrl);
  const setRoomOnlineCountProvider = useRoomStore(
    (state) => state.setRoomOnlineCountProvider,
  );
  const updateLinkShare = useRoomStore((state) => state.updateLinkShare);
  const invitedUsers = useRoomStore((state) => state.invitedUsers);

  const [isOpenShareModal, setIsOpenShareModal] = useState(false);

  const [selectedRoles, setSelectedRoles] = useState({});
  const roles = ["viewer", "editor", "commenter"];
  const access = ["anyone", "invited"];
  const link = `${import.meta.env.VITE_CLIENT_URL}/notes-together/join-link/${room?.shareLink?.token}/${room?.shareLink?.role || "viewer"}`;
  const [activeTab, setActiveTab] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isChangeCode, setIsChangeCode] = useState(false);
  const [selectedRole, setSelectedRole] = useState(room?.shareLink?.role);
  const [selectedAccess, setSelectedAccess] = useState(room?.shareLink?.access);

  const [isAllowLinkSharing, setIsAllowLinkSharing] = useState(true);
  const [isAllowCodeSharing, setIsAllowCodeSharing] = useState(true);

  const [saveStatus, setSaveStatus] = useState("idle");

  const permissionUser = room?.members?.find(
    (m) => m.user._id === user._id,
  )?.role;
  const isEditable = permissionUser === "owner" || permissionUser === "editor";

  useEffect(() => {
    if (!searchTerm.trim()) {
      clearUsers();
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      getUser(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, getUser, clearUsers]);

  useEffect(() => {
    if (room) {
      setIsAllowLinkSharing(room.isAllowLinkSharing ?? true);
      setIsAllowCodeSharing(room.isAllowCodeSharing ?? true);
    }
  }, [room]);

  const [typingUsers, setTypingUsers] = useState({}); // เก็บรายชื่อคนที่กำลังพิมพ์อยู่ เช่น { "user_1": "Somchai" }
  const isTypingRef = useRef(false); // ใช้จำสถานะตัวเองว่าตอนนี้กำลังพิมพ์อยู่ไหม
  const timeoutRef = useRef(null); // ใช้เก็บเลเซอร์นับเวลาถอยหลังการหยุดพิมพ์

  const fileInputRef = useRef(null); // image upload

  const timerRef = useRef(null);

  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (!provider || !user?.username) return;

    provider.awareness.setLocalStateField("user", {
      _id: user._id,
      username: user.username,
      avatar: user.avatar,

      name: user.username,
      color: user.avatar,
    });
  }, [provider, user.username, user.avatar]);

  useEffect(() => {
    if (!provider) return;

    const handleAwarenessUpdate = () => {
      const states = provider.awareness.getStates();

      // 🟢 แปลง Map Object เป็น Array เพื่อเอาไปใช้งานง่ายๆ
      const usersArray = Array.from(states.values())
        .filter((state) => state.user) // กรองเอาเฉพาะอันที่มีข้อมูล user ผูกอยู่
        .map((state) => state.user);

      setRoomOnlineCountProvider(usersArray);
      setActiveUsers(usersArray);
    };

    provider.awareness.on("change", handleAwarenessUpdate);

    handleAwarenessUpdate();

    return () => {
      provider.awareness.off("change", handleAwarenessUpdate);
    };
  }, [provider]);

  // ==========================================
  // 1. useEffect: จับจังหวะพิมพ์งาน (ขาไป)
  // ==========================================
  useEffect(() => {
    if (!yjs) return;

    const handleDocUpdate = (update, origin) => {
      // เช็กสถานะ origin เพื่อให้มั่นใจว่าเป็นข้อมูลที่เราพิมพ์เอง
      if (origin !== null) {
        setSaveStatus("saving");

        // ล้าง Timer เดิมทิ้งทันทีเมื่อมีการพิมพ์ใหม่ (เพื่อไม่ให้มันสลับไป idle กลางคัน)
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      }
    };

    yjs.on("update", handleDocUpdate);

    // 🔒 ล้างข้อมูล
    return () => {
      yjs.off("update", handleDocUpdate);
    };
  }, [yjs]);

  // ==========================================
  // 2. useEffect: รับข้อความบันทึกสำเร็จ (ขากลับ)
  // ==========================================
  useEffect(() => {
    const targetRoomId = room?._id;
    if (!socket || !targetRoomId) return;

    const eventName = `syncStatus:${targetRoomId}`;
    const handleSyncStatus = (res) => {
      if (res.status === "saved") {
        setSaveStatus("saved");

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setSaveStatus("idle");
        }, 3000);
      }
    };

    socket.on(eventName, handleSyncStatus);

    return () => {
      socket.off(eventName, handleSyncStatus);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [socket, room?._id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room?.code);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 1000);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    updateLinkShare(room._id, role, selectedAccess);
  };

  const handleAccessChange = (access) => {
    setSelectedAccess(access);
    updateLinkShare(room._id, selectedRole, access);
  };

  const handleInvite = (userId) => {
    invitedUsers(room?._id, userId);
  };

  // 🛠️ 1. สร้าง Custom Font Size Extension ขึ้นมาเองแบบง่าย ๆ
  const FontSize = Extension.create({
    name: "fontSize",

    addOptions() {
      return {
        types: ["textStyle"],
      };
    },

    addGlobalAttributes() {
      return [
        {
          types: this.options.types,
          attributes: {
            fontSize: {
              default: null,
              // 🔍 ดักจับค่าจาก HTML ตอนโหลดข้อมูลเก่าขึ้นมาเปิด
              parseHTML: (element) =>
                element.style.fontSize?.replace(/['"]+/g, ""),
              // 🎨 สั่งพ่นสไตล์ลงในแท็ก <span> ของ TipTap บนหน้าจอจริง
              renderHTML: (attributes) => {
                if (!attributes.fontSize) return {};
                return { style: `font-size: ${attributes.fontSize}` };
              },
            },
          },
        },
      ];
    },

    addCommands() {
      return {
        setFontSize:
          (size) =>
          ({ chain }) => {
            return chain().setMark("textStyle", { fontSize: size }).run();
          },
        unsetFontSize:
          () =>
          ({ chain }) => {
            return chain().setMark("textStyle", { fontSize: null }).run();
          },
      };
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    const uploadedUrl = await uploadImage(formData);

    if (uploadedUrl) {
      editor.chain().focus().setImage({ src: uploadedUrl }).run();
    }
  };

  // auto scroll
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const editorStartRef = useRef(null);
  const scrollToTop = () => {
    editorStartRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    scrollToTop();
  }, [comments, typingUsers]);

  // send comment
  const handleSend = () => {
    if (!typedMessage.trim() || permissionUser === "viewer") return;

    // 🚩 จังหวะกดส่ง: สั่งหยุดพิมพ์ทันที ไม่ต้องรอครบ 2 วินาที
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isTypingRef.current = false;
    socket?.emit("stop_typing");

    const type = "text";
    addCommentFromMe(room?._id, type, typedMessage);

    setTypedMessage("");
  };

  const handleSendSticker = (seletedSticker) => {
    if (permissionUser === "viewer") return;
    const type = "sticker";
    addCommentFromMe(room?._id, type, seletedSticker);
  };

  const handleTypingChange = (e) => {
    if (permissionUser === "viewer") return;
    setTypedMessage(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket?.emit("typing");
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket?.emit("stop_typing");
    }, 2000);
  };

  //event user typing
  useEffect(() => {
    if (!socket) return;

    socket.on("user_typing", ({ userId, username }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: username }));
    });

    socket.on("user_stop_typing", ({ userId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    socket.on("received_comment", ({ newComment }) => {
      addCommentFromSocket(newComment);
    });

    socket.on("role_updated", async ({ targetUserId, newRole }) => {
      useRoomStore.setState((state) => {
        // ฟังก์ชันช่วย Map สลับ Role ใน members ให้เป็นค่าใหม่สดๆ ร้อนๆ
        const updateRoomObject = (room) => {
          if (!room || room._id !== roomId) return room;
          return {
            ...room,
            members: room.members.map((m) =>
              m.user?._id === targetUserId ? { ...m, role: newRole } : m,
            ),
          };
        };

        return {
          ...state,
          myRooms: state.myRooms.map(updateRoomObject),
          rooms: state.rooms.map(updateRoomObject),
          recentRooms: state.recentRooms.map(updateRoomObject),
          roomData:
            state.roomData?._id === roomId
              ? updateRoomObject(state.roomData)
              : state.roomData,
        };
      });

      if (targetUserId === user._id) {
        navigate(`/notes-together/${roomId}/${newRole}`, { replace: true });
      } else {
        getMyRooms();
      }
    });

    return () => {
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("received_comment");
      socket.off("role_updated");
    };
  }, [room?._id, user?._id]);

  // convert object of user typing to array
  const typingUserNames = Object.values(typingUsers);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false,
          heading: { levels: [1, 2, 3, 4, 5, 6] },
          bulletList: true,
          orderedList: true,
          blockquote: true,
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"], // ให้จัดหน้าได้ทั้งหัวข้อและย่อหน้าปกติ
        }),
        TextStyle,
        FontSize,
        FontFamily,
        Color,
        Image,
        Collaboration.configure({
          document: yjs,
          field: "content", // ปรับให้ชื่อฟิลด์โครงสร้างตรงกับโมเดลเบหลังบ้าน
        }),
        CollaborationCursor.configure({
          provider: provider,
          user: {
            name: user?.username || "Guest",
            color: user?.avatar || "#4893e8",
          },
          render(user) {
            const cursor = document.createElement("span");
            cursor.classList.add("collab-cursor");
            cursor.style.borderColor = user.color;

            const label = document.createElement("div");
            label.classList.add("collab-cursor-label");
            label.style.backgroundColor = user.color;

            const dot = document.createElement("span");
            dot.classList.add("collab-cursor-dot");

            label.appendChild(dot);
            label.appendChild(document.createTextNode(user.name));
            cursor.appendChild(label);
            return cursor;
          },
        }),
      ],
      editorProps: {
        attributes: {
          class: "prose max-w-none focus:outline-none",
        },
      },
      content: "<h1>หัวข้อรายงาน A4</h1><p>เริ่มพิมพ์ข้อความตรงนี้...</p>",
      editable: false,
    },
    [yjs],
  );

  useEffect(() => {
    if (editor && !editor.isDestroyed && permissionUser !== undefined) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor, permissionUser]);

  if (!editor) return null;

  return (
    <div className="w-full h-full sm:p-0 sm:pt-0 overflow-y-auto no-scrollbar">
      <div className="" ref={editorStartRef}>
        <div className="w-full flex items-center justify-between p-5 px-8 bg-third border-b-2 border-gray-200">
          <div className="text-2xl font-semibold">{room?.name || ""}</div>
          <div className="text-lg text-gray-400 font-medium">
            {saveStatus === "saving" && <span>saving data...</span>}
            {saveStatus === "saved" && (
              <span className="text-green-500">changes saved</span>
            )}
            {saveStatus === "idle" && (
              <span className="text-gray-300">data synced</span>
            )}
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-1 -space-x-4">
              {activeUsersList?.slice(0, 5).map((member, index) => (
                <div
                  key={member._id || index}
                  style={{ borderColor: member?.avatar }}
                  className="flex-none bg-white border-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <Icon
                    icon="mdi:account"
                    style={{ color: member?.avatar }}
                    width="30"
                  />
                </div>
              ))}
              {activeUsersList?.length > 5 && (
                <div className="flex-none bg-gray-200 border-2 border-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 z-0">
                  +{activeUsersList.length - 5}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsOpenShareModal(!isOpenShareModal)}
                className="bg-primary cursor-pointer hover:bg-blue-500 px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-sm font-semibold text-white"
              >
                <Icon icon="mdi:share" width="20" />
                Share
              </button>
              {isOpenShareModal && (
                <>
                  <div className="absolute flex flex-col z-20 min-w-100 -right-20 mt-5 ">
                    <div className="bg-gray-200 py-2 px-3 rounded-t-2xl">
                      <button
                        onClick={() => setActiveTab(1)}
                        className={`flex-1 py-2.5 cursor-pointer px-2 text-center font-medium text-sm border-b-2 transition-colors duration-200 ${
                          activeTab === 1
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Link
                      </button>

                      <button
                        onClick={() => setActiveTab(2)}
                        className={`flex-1 py-2.5 cursor-pointer px-2 text-center font-medium text-sm border-b-2 transition-colors duration-200 ${
                          activeTab === 2
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Code
                      </button>

                      <button
                        onClick={() => setActiveTab(3)}
                        className={`flex-1 py-2.5 cursor-pointer px-2 text-center font-medium text-sm border-b-2 transition-colors duration-200 ${
                          activeTab === 3
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Invite
                      </button>
                    </div>

                    <div className="bg-third px-5 py-5 rounded-b-2xl border-2 border-gray-200">
                      {activeTab === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          <div className="flex flex-col gap-3 relative mb-1">
                            <div className="flex justify-between items-center gap-5">
                              <div className="flex-1 px-2 border border-gray rounded-lg">
                                <select
                                  value={room?.shareLink?.role}
                                  onChange={(e) =>
                                    handleRoleChange(e.target.value)
                                  }
                                  className={`${isAllowLinkSharing ? "cursor-pointer" : "cursor-not-allowed"} px-2 py-1 outline-0 text-sm font-medium text-secondary`}
                                  disabled={!isAllowLinkSharing}
                                >
                                  {roles.map((role) => (
                                    <option key={role} value={role}>
                                      {role}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="px-4 border border-gray rounded-lg">
                                <select
                                  value={room?.shareLink?.access || "anyone"}
                                  onChange={(e) =>
                                    handleAccessChange(e.target.value)
                                  }
                                  name="people-with-access"
                                  id=""
                                  className={`${isAllowLinkSharing ? "cursor-pointer" : "cursor-not-allowed"} ps-1 pe-3 py-1 outline-0 rounded-lg text-sm font-medium text-secondary`}
                                  disabled={!isAllowLinkSharing}
                                >
                                  {access.map((ac) => (
                                    <option key={ac} value={ac}>
                                      {ac === "anyone"
                                        ? "anyone with link"
                                        : "only invited people"}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-5 items-center">
                              <input
                                type="text"
                                readOnly
                                onCopy={(e) =>
                                  isAllowLinkSharing === false &&
                                  e.preventDefault()
                                }
                                onCut={(e) =>
                                  isAllowLinkSharing === false &&
                                  e.preventDefault()
                                }
                                onPaste={(e) =>
                                  isAllowLinkSharing === false &&
                                  e.preventDefault()
                                }
                                value={link || ""}
                                className={`${isAllowLinkSharing ? "cursor-pointer" : "cursor-not-allowed"} flex-1 py-2 outline-none px-4 text-md rounded-lg border-2 border-gray text-black`}
                              />

                              <button
                                disabled={!isAllowLinkSharing}
                                onClick={handleCopy}
                                className={`${isAllowLinkSharing ? "bg-blue-500 hover:bg-blue-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed"} text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
                              >
                                {isCopied ? "Copied" : "Copy"}
                              </button>
                            </div>
                            {!isAllowLinkSharing && (
                              <span className="text-red-600">
                                The room owner has disabled sharing via link.
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {activeTab === 2 && (
                        <>
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex gap-3 relative mb-3">
                              <input
                                type="text"
                                readOnly
                                onCopy={(e) =>
                                  isAllowCodeSharing === false &&
                                  e.preventDefault()
                                }
                                onCut={(e) =>
                                  isAllowCodeSharing === false &&
                                  e.preventDefault()
                                }
                                onPaste={(e) =>
                                  isAllowCodeSharing === false &&
                                  e.preventDefault()
                                }
                                value={room?.code || ""}
                                className={`${isAllowCodeSharing ? "cursor-pointer" : "cursor-not-allowed"} flex-1 py-2 outline-none px-4 text-sm rounded-lg border border-gray text-gray-500`}
                              />

                              <button
                                disabled={!isAllowCodeSharing}
                                onClick={handleCopyCode}
                                className={`${isAllowCodeSharing ? "bg-blue-500 hover:bg-blue-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed"} text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
                              >
                                {isCopiedCode ? "Copied" : "Copy"}
                              </button>
                            </div>
                            {!isAllowCodeSharing && (
                              <span className="text-red-600">
                                The room owner has disabled sharing via code.
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      {activeTab === 3 && (
                        <>
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex flex-col gap-3 relative mb-3">
                              <div className="bg-white flex items-center rounded-xl relative">
                                <Icon
                                  icon="mdi:search"
                                  width="20"
                                  height="20"
                                  className="absolute left-2 text-secondary"
                                />
                                <input
                                  type="text"
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                  className="w-full py-1.5 rounded-lg ps-9 outline-0 font-normal text-gray-500 border-2 border-gray text-sm"
                                />
                              </div>
                              <div className=" max-h-42 overflow-auto no-scrollbar">
                                {users.map((user) => {
                                  const isMember = room?.members?.some(
                                    (member) => member?.user?._id === user?._id,
                                  );

                                  const isInvited = room?.invitedUsers?.some(
                                    (m) => {
                                      // กรณีที่ 1: m เป็น Object ให้เช็ก m?._id
                                      // กรณีที่ 2: m เป็น String ID โล่งๆ ให้เอา m มาเทียบตรงๆ ได้เลย
                                      return (m?._id || m) === user?._id;
                                    },
                                  );

                                  return (
                                    <div
                                      key={user?._id}
                                      className="flex items-center justify-between py-2 px-5"
                                    >
                                      <div className=" flex items-center gap-3">
                                        <div
                                          style={{ borderColor: user?.avatar }}
                                          className="flex-none bg-white border-2 w-10 h-10 rounded-full flex items-center justify-center"
                                        >
                                          <Icon
                                            icon="mdi:account"
                                            style={{ color: user?.avatar }}
                                            width="30"
                                          />
                                        </div>
                                        <div className="flex flex-col ">
                                          <span className="font-bold text-sm truncate text-slate-800">
                                            {user?.username}
                                          </span>
                                          <span className="font-normal text-xs text-secondary truncate">
                                            {user?.email}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <button
                                          onClick={() =>
                                            handleInvite(user?._id)
                                          }
                                          disabled={isInvited}
                                          className={`${isInvited ? "bg-gray-300 cursor-not-allowed" : "bg-blue-400 cursor-pointer hover:bg-blue-500"} flex text-white items-center gap-2 px-5 text-sm py-1 font-semibold rounded-md `}
                                        >
                                          <Icon icon="mdi:invite" width={20} />
                                          Invite
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-1 rounded-lg text-secondary">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              {activeUsersList.length || 1} online
            </div>
          </div>
        </div>
        {/* toolbar */}
        <div className="flex justify-evenly">
          <div className="w-full min-w-100 max-w-260 ">
            <div className="w-full top-0 py-5 gap-3 sticky z-10">
              {isEditable && (
                <div className="w-full flex py-3 px-3 rounded-md shadow-sm bg-gray-100 border border-slate-200">
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("bold") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Bold (Ctrl+B)"
                  >
                    <Icon icon="mdi:format-bold" width="20" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={
                      !editor.can().chain().focus().toggleItalic().run()
                    }
                    className={`p-2 rounded transition-colors ${editor.isActive("italic") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Italic (Ctrl+I)"
                  >
                    <Icon icon="mdi:format-italic" width="20" />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleUnderline().run()
                    }
                    className={`p-2 rounded transition-colors ${editor.isActive("underline") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Underline (Ctrl+U)"
                  >
                    <Icon icon="mdi:format-underline" width="20" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("strike") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Strikethrough"
                  >
                    <Icon icon="mdi:format-strikethrough-variant" width="20" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive("code") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Inline Code"
                  >
                    <Icon icon="mdi:code-tags" width="20" />
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  {/* เส้นคั่น */}
                  {/* --- Group 2: Headings --- */}
                  <select
                    onChange={(e) => {
                      if (e.target.value === "none") {
                        editor.chain().focus().setParagraph().run();
                      } else {
                        const levelValue = Number(e.target.value);

                        editor
                          .chain()
                          .focus()
                          .setHeading({ level: levelValue })
                          .run();
                      }
                    }}
                    className="p-1.5 border border-slate-300 rounded text-sm text-slate-600 bg-white outline-none cursor-pointer hover:border-blue-400"
                    title="Headings"
                  >
                    <option value="none">Heading</option>
                    <option value="1">H1</option>
                    <option value="2">H2</option>
                    <option value="3">H3</option>
                    <option value="4">H4</option>
                    <option value="5">H5</option>
                    <option value="6">H6</option>
                  </select>
                  <div className="w-px h-6 bg-slate-200 ms-1" />
                  {/* เส้นคั่น */}
                  {/* font style */}
                  {/* 🔤 1. Dropdown เลือกฟอนต์ (Font Family) */}
                  <select
                    onChange={(e) => {
                      if (e.target.value === "normal") {
                        editor.chain().focus().unsetFontFamily().run();
                      } else {
                        editor
                          .chain()
                          .focus()
                          .setFontFamily(e.target.value)
                          .run();
                      }
                    }}
                    className="p-1.5 border border-slate-300 rounded text-sm text-slate-600 bg-white outline-none cursor-pointer hover:border-blue-400"
                    title="Font Family"
                  >
                    <option value="normal">Default Font</option>
                    <option value="Arial">Arial</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                    <option value="Bitcount Single">Bitcount Single</option>
                    <option value="Indie Flower">Indie Flower</option>
                    <option value="Amatic SC">Amatic SC</option>
                  </select>
                  {/* 📐 2. Dropdown เลือกขนาดตัวอักษร (Font Size) */}
                  <select
                    onChange={(e) => {
                      if (e.target.value === "normal") {
                        editor.chain().focus().unsetFontSize().run();
                      } else {
                        editor
                          .chain()
                          .focus()
                          .setFontSize(e.target.value)
                          .run();
                      }
                    }}
                    className="p-1.5 border border-slate-300 rounded text-sm text-slate-600 bg-white outline-none cursor-pointer hover:border-blue-400 ml-1"
                    title="Font Size"
                  >
                    <option value="normal">Size</option>
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="24px">24px</option>
                    <option value="32px">32px</option>
                    <option value="64px">64px</option>
                    <option value="128px">128px</option>
                  </select>
                  {/* --- Group 3: Lists & Blocks --- */}
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleBulletList().run()
                    }
                    className={`p-2 rounded ${editor.isActive("bulletList") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                  >
                    <Icon icon="mdi:format-list-bulleted" width="20" />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleOrderedList().run()
                    }
                    className={`p-2 rounded ${editor.isActive("orderedList") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                  >
                    <Icon icon="mdi:format-list-numbered" width="20" />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleBlockquote().run()
                    }
                    className={`p-2 rounded ${editor.isActive("blockquote") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                  >
                    <Icon icon="mdi:format-quote-close" width="20" />
                  </button>
                  {/* ปุ่มอัปโหลดรูปภาพ */}
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className={`p-2 rounded ${editor.isActive("image") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Upload Image"
                  >
                    <Icon icon="mdi:image-outline" width="20" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() =>
                      editor.chain().focus().setTextAlign("left").run()
                    }
                    className={`p-2 rounded ${editor.isActive({ textAlign: "left" }) ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Align Left"
                  >
                    <Icon icon="mdi:format-align-left" width="20" />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().setTextAlign("center").run()
                    }
                    className={`p-2 rounded ${editor.isActive({ textAlign: "center" }) ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Align Center"
                  >
                    <Icon icon="mdi:format-align-center" width="20" />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().setTextAlign("right").run()
                    }
                    className={`p-2 rounded ${editor.isActive({ textAlign: "right" }) ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Align Right"
                  >
                    <Icon icon="mdi:format-align-right" width="20" />
                  </button>
                  <div
                    className={`relative flex items-center justify-center overflow-hidden p-2 rounded ${editor.isActive("textStyle") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Text Color"
                  >
                    <Icon icon="mdi:format-color-text" width="20" />
                    <input
                      type="color"
                      onChange={(e) =>
                        editor.chain().focus().setColor(e.target.value).run()
                      }
                      className="absolute inset-0 w-[200%] h-[200%] -ml-[50%] -mt-[50%] opacity-0 cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={() =>
                      editor.chain().focus().setHorizontalRule().run()
                    }
                    className={`p-2 rounded ${editor.isActive("horizontalRule") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Divider"
                  >
                    <Icon icon="mdi:minus" width="20" />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().toggleCodeBlock().run()
                    }
                    className={`p-2 rounded ${editor.isActive("codeBlock") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                    title="Code Block"
                  >
                    <Icon icon="mdi:code-braces" width="20" />
                  </button>
                  <div className="flex-1 " /> {/* ดันปุ่มที่เหลือไปทางขวา */}
                  {/* --- Group 4: Clear Formatting --- */}
                  <button
                    onClick={() =>
                      editor.chain().focus().unsetAllMarks().clearNodes().run()
                    }
                    className="p-2 rounded hover:bg-red-100 text-red-400"
                    title="Clear Formatting"
                  >
                    <Icon icon="mdi:format-clear" width="20" />
                  </button>
                </div>
              )}
            </div>
            <div className="editor-background">
              <div className="w-fit overflow-auto no-scrollbar">
                <EditorContent
                  editor={editor}
                  className="border border-slate-300 "
                />
              </div>
            </div>
          </div>

          <div className="sticky z-0 top-0 w-70 h-fit">
            <div className="flex flex-col pt-4">
              <span className="flex items-center gap-2 font-semibold">
                Comments <Icon icon="mdi:comment" className="" />
              </span>
              <div className="flex flex-col border-gray-300 border-2 rounded-lg w-full h-150 my-4 p-5 overflow-auto no-scrollbar">
                {(comments?.comments || comments || []).map((c) => {
                  const isMe = c?.sender?._id === user?._id;

                  return (
                    <div
                      key={c?._id || Math.random()}
                      className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] border border-gray-200 px-5 py-2 my-3 rounded-xl shadow-sm ${
                          isMe
                            ? "bg-blue-50/60 border-blue-200 rounded-tr-none"
                            : "bg-white rounded-tl-none"
                        }`}
                      >
                        <div
                          className={`flex gap-2 items-center mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            style={{ borderColor: c?.sender?.avatar }}
                            className="flex-none border-2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer bg-white"
                          >
                            <Icon
                              icon="mdi:account"
                              color={c?.sender?.avatar}
                              width="30"
                            />
                          </div>

                          <div
                            className={`flex flex-col leading-tight ${isMe ? "items-end" : "items-start"}`}
                          >
                            <span className="font-bold text-sm text-slate-800">
                              {isMe ? "You" : c?.sender?.username}
                            </span>
                            <span className="font-normal text-[10px] text-gray-400">
                              {formatChatTime(c.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{ borderColor: c?.sender?.avatar }}
                          className={`py-2 px-4 text-sm text-slate-700 whitespace-pre-wrap wrap-break-word ${
                            isMe
                              ? "border-e-2 me-1 text-right"
                              : "border-s-2 ms-1"
                          }`}
                        >
                          {c.type === "sticker" ? (
                            <img
                              src={`${import.meta.env.VITE_PATH_STICKERS}?nameImg=${c?.stickerUrl.replace(".png", "")}`}
                              alt="sticker"
                              className="w-22 h-22 object-contain animate-bounce-once"
                            />
                          ) : (
                            c.text
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="">
                  {typingUserNames.length > 0 && (
                    <span className="h-6 text-sm text-gray-500 italic rounded-md bg-gray-200 px-2">
                      {typingUserNames.join(", ")}{" "}
                      {typingUserNames.length === 1 ? "is" : "are"} typing...
                    </span>
                  )}
                </div>
                <div ref={messagesEndRef} />{" "}
                {/* จุดปักหมุดสำหรับ Auto Scroll */}
              </div>
              <div className="flex flex-col justify-center relative">
                <ChatInput
                  value={typedMessage}
                  onChangeText={handleTypingChange}
                  onSend={handleSend}
                  onSendSticker={(stickerSelect) =>
                    handleSendSticker(stickerSelect)
                  }
                  permissionUser={permissionUser}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;
