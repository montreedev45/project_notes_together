import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Collaboration } from "@tiptap/extension-collaboration";
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret";
import { createYjs } from "../lib/yjs";
import { Icon } from "@iconify/react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket, getSocket } from "../socket";
import { formatChatTime } from "../utils/formatTime";
import useAuthStore from "../store/useAuthStore";
import useRoomStore from "../store/useRoomStore";
import useCommentStore from "../store/useCommentStore";

import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import { Image } from "@tiptap/extension-image";
import { FontFamily } from "@tiptap/extension-font-family";
import { exportToPDF } from "../utils/exportToPdf";
import { LimitPageHeight } from "../utils/limitPageHeight";
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

  // Find Room Data
  const roomData =
    rooms.find((r) => r._id === roomId) ||
    myRooms.find((r) => r._id === roomId);

  // Fetch Room & Comment Data
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
  }, [user, roomId]);

  // Permission Guard (เตะออกถ้าไม่มีสิทธิ์)
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

  // สิทธิ์เข้าถึง = เป็นสมาชิก OR เป็นเจ้าของ OR เป็นห้อง Public
  const hasAccess = Boolean(roomData && (isMember || isOwner || isPublic));

  // Socket Connection (เชื่อมต่อเมื่อเช็กสิทธิ์ผ่านแล้วเท่านั้น!)
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

  // Yjs Provider Setup (จะสร้างเมื่อเช็กสิทธิ์ผ่านแล้วเท่านั้น!)
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

  // กำลังเช็กสิทธิ์ และ ดึงข้อมูลห้อง
  if (!isReady || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="animate-pulse text-slate-400 font-medium">
          Checking access permissions...
        </p>
      </div>
    );
  }

  // ถ้าไม่มีข้อมูล หรือไม่มีสิทธิ์เข้าห้อง (จะถูก useEffect เตะออกไปแล้ว)
  if (!roomData || !hasAccess) {
    return null;
  }

  // เช็กสิทธิ์ผ่านแล้ว กำลังเชื่อมต่อ Realtime/Yjs
  if (!yjs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-slate-400 font-medium">
          Connecting to sync server...
        </div>
      </div>
    );
  }

  // พร้อมใช้งาน Render Editor
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
                onClick={(e) => {
                  e.stopPropagation();
                  onSendSticker(fileName);
                  setIsOpenStickerModal(false);
                }}
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
        className="w-full border-2 border-gray-200 rounded-lg h-10 ps-10 pe-10 outline-none"
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

  const socket = getSocket();

  const { roomId } = useParams();
  const [typedMessage, setTypedMessage] = useState("");
  const addCommentFromMe = useCommentStore((state) => state.addCommentFromMe);
  const uploadImage = useNoteStore((state) => state.uploadImage);
  const setRoomOnlineCountProvider = useRoomStore(
    (state) => state.setRoomOnlineCountProvider,
  );
  const updateLinkShare = useRoomStore((state) => state.updateLinkShare);
  const invitedUsers = useRoomStore((state) => state.invitedUsers);
  const updateRoomCode = useRoomStore((state) => state.updateRoomCode);

  const [isOpenShareModal, setIsOpenShareModal] = useState(false);
  const [isOpenCommentModal, setIsOpenCommentModal] = useState(false);

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
    (m) => m.user?._id === user._id,
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

      // แปลง Map Object เป็น Array เพื่อเอาไปใช้งานง่ายๆ
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

  const handleUpdateCodeRoom = async () => {
    if (loading) return;

    setIsChangeCode(true);
    const result = await updateRoomCode(roomData._id);

    if (result.success) {
      setTimeout(() => {
        setIsChangeCode(false);
      }, 1000);
    } else {
      setIsChangeCode(false);
      alert(result.message);
    }
  };

  const handleInvite = (userId) => {
    invitedUsers(room?._id, userId);
  };

  const handleExport = () => {
    const fileName = `${room.name ?? "note"}.pdf`;
    exportToPDF("note-content-container", fileName);
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
    formData.append("roomId", roomId);
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

    // จังหวะกดส่ง: สั่งหยุดพิมพ์ทันที ไม่ต้องรอครบ 2 วินาที
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
        TextAlign.configure({
          types: ["heading", "paragraph"],
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
        CollaborationCaret.configure({
          provider: provider,
          user: {
            name: user?.username || "Guest",
            color: user?.avatar || "#4893e8",
          },
          render(user) {
            const cursor = document.createElement("span");
            cursor.classList.add("collab-caret"); // ปรับชื่อคลาสให้ตรงกัน
            cursor.style.borderLeftColor = user.color; // ใช้ border-left สำหรับขีดเคอร์เซอร์แนวตั้งที่สวยงาม

            const label = document.createElement("div");
            label.classList.add("collab-caret-label");
            label.style.backgroundColor = user.color;

            const dot = document.createElement("span");
            dot.classList.add("collab-caret-dot");

            label.appendChild(dot);
            label.appendChild(document.createTextNode(user.name));
            cursor.appendChild(label);
            return cursor;
          },
        }),
        LimitPageHeight,
      ],
      editorProps: {
        attributes: {
          class: "tiptap focus:outline-none",
        },
      },
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
        {/* Main layout */}
        <div className="flex flex-col justify-center items-center">
          <div className="w-full flex-col items-center justify-center sticky z-10 top-0 bg-white">
            {/* Menu bar */}
            <div className="w-full flex items-center justify-between p-3 md:p-4 px-4 md:px-6 border-b border-gray-100 z-50 shadow-sm bg-gray-50">
              {/* 1. Room Name & Save Status */}
              <div className="flex flex-row justify-center items-end gap-4 truncate">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 truncate max-w-37.5 md:max-w-xs">
                  {room?.name || "Untitled Room"}
                </h1>
                <div className="text-xs md:text-sm font-medium">
                  {saveStatus === "saving" && (
                    <span className="text-slate-400">Saving...</span>
                  )}
                  {saveStatus === "saved" && (
                    <span className="text-green-500">All changes saved</span>
                  )}
                  {saveStatus === "idle" && (
                    <span className="text-slate-400">Synced</span>
                  )}
                </div>
              </div>

              {/* 2. Online Users & Share & Export*/}
              <div className="flex items-center gap-4">
                <div className=" sm:flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {activeUsersList.length || 1}
                  </div>
                  <div className="hidden md:flex items-center -space-x-2">
                    {activeUsersList?.slice(0, 3).map((member, index) => (
                      <div
                        key={member._id || index}
                        style={{ borderColor: member?.avatar || "#e2e8f0" }}
                        className="flex-none bg-white border-2 w-8 h-8 rounded-full flex items-center justify-center z-10"
                      >
                        <Icon
                          icon="mdi:account"
                          style={{ color: member?.avatar }}
                          width="20"
                        />
                      </div>
                    ))}
                    {activeUsersList?.length > 3 && (
                      <div className="flex-none bg-gray-100 border-2 border-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 z-0">
                        +{activeUsersList.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 items-center relative">
                  <button
                    onClick={() => setIsOpenShareModal(!isOpenShareModal)}
                    className="bg-primary hover:bg-blue-600 px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-sm font-bold text-white transition-colors"
                  >
                    <Icon icon="mdi:share-variant" width="18" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={handleExport}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-sm font-bold transition-colors"
                  >
                    <Icon icon="mdi:export" width="18" />
                    <span className="hidden sm:inline">Export</span>
                  </button>

                  {/* Share Dropdown (แก้ไขให้ไม่ล้นจอ) */}
                  {isOpenShareModal && (
                    <div className="absolute top-full right-0 mt-3 w-[320px] sm:w-90 bg-white rounded-xl shadow-2xl border border-gray-200 z-60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Tabs */}
                      <div className="flex bg-slate-50 border-b border-gray-200">
                        {["Link", "Code", "Invite"].map((tab, idx) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(idx + 1)}
                            className={`flex-1 py-3 text-sm font-bold transition-colors ${
                              activeTab === idx + 1
                                ? "text-primary border-b-2 border-primary bg-white"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content Area (จำกัดความสูงไว้ไม่ให้ยาวเกินไป) */}
                      <div className="p-4 max-h-100 overflow-y-auto no-scrollbar">
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
                              <div className="flex flex-col gap-3 relative mb-3">
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

                                <div className="flex gap-4">
                                  <button
                                    disabled={!isAllowCodeSharing}
                                    onClick={handleCopyCode}
                                    className={`${isAllowCodeSharing ? "bg-blue-500 hover:bg-blue-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed"} text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
                                  >
                                    {isCopiedCode ? "Copied" : "Copy"}
                                  </button>
                                  <button
                                    disabled={!isAllowCodeSharing}
                                    onClick={handleUpdateCodeRoom}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95 ${
                                      isAllowCodeSharing
                                        ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                  >
                                    {isChangeCode ? "Changing..." : "Reset"}
                                  </button>
                                </div>
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
                                      (member) =>
                                        member?.user?._id === user?._id,
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
                                            style={{
                                              borderColor: user?.avatar,
                                            }}
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
                                            <Icon
                                              icon="mdi:invite"
                                              width={20}
                                            />
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
                  )}
                </div>
              </div>
            </div>
            {isEditable && (
              // Tool bar
              <div className="flex justify-center items-center pt-5 pb-10 px-5 bg-gray-50">
                <div className="flex w-full flex-wrap max-w-7xl items-center gap-1.5 p-2 md:py-5 rounded-xl bg-gray-50 border-gray-200 border-2">
                  {/* 📝 Group 1: Basic Formatting */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      disabled={
                        !editor.can().chain().focus().toggleBold().run()
                      }
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive("bold") ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                      title="Bold (Ctrl+B)"
                    >
                      <Icon icon="mdi:format-bold" width="20" />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      disabled={
                        !editor.can().chain().focus().toggleItalic().run()
                      }
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive("italic") ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                      title="Italic (Ctrl+I)"
                    >
                      <Icon icon="mdi:format-italic" width="20" />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                      }
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive("underline") ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                      title="Underline (Ctrl+U)"
                    >
                      <Icon icon="mdi:format-underline" width="20" />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                      }
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive("strike") ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                      title="Strikethrough"
                    >
                      <Icon
                        icon="mdi:format-strikethrough-variant"
                        width="20"
                      />
                    </button>
                    <button
                      onClick={() => editor.chain().focus().toggleCode().run()}
                      className={`p-2 rounded transition-colors ${editor.isActive("code") ? "bg-blue-100 text-blue-600" : "hover:bg-blue-100 text-slate-600"}`}
                      title="Inline Code"
                    >
                      <Icon icon="mdi:code-tags" width="20" />
                    </button>
                  </div>
                  <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
                  {/* 🔠 Group 2: Typography (Headings, Font, Size) */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      onChange={(e) => {
                        if (e.target.value === "none")
                          editor.chain().focus().setParagraph().run();
                        else
                          editor
                            .chain()
                            .focus()
                            .setHeading({ level: Number(e.target.value) })
                            .run();
                      }}
                      value={
                        editor.isActive("heading", { level: 1 })
                          ? "1"
                          : editor.isActive("heading", { level: 2 })
                            ? "2"
                            : editor.isActive("heading", { level: 3 })
                              ? "3"
                              : "none"
                      }
                      className="p-1.5 border border-gray-300 rounded-lg text-sm font-medium text-slate-700 bg-white outline-none cursor-pointer hover:border-primary focus:ring-2 focus:ring-blue-100 min-w-22.5"
                    >
                      <option value="none">Normal</option>
                      <option value="1">Heading 1</option>
                      <option value="2">Heading 2</option>
                      <option value="3">Heading 3</option>
                      <option value="4">Heading 4</option>
                      <option value="5">Heading 5</option>
                      <option value="6">Heading 6</option>
                    </select>

                    <select
                      onChange={(e) => {
                        if (e.target.value === "normal")
                          editor.chain().focus().unsetFontFamily().run();
                        else
                          editor
                            .chain()
                            .focus()
                            .setFontFamily(e.target.value)
                            .run();
                      }}
                      className="p-1.5 border border-gray-300 rounded-lg text-sm font-medium text-slate-700 bg-white outline-none cursor-pointer hover:border-primary min-w-25"
                    >
                      <option value="normal">Default Font</option>
                      <option value="Arial">Arial</option>
                      <option value="Courier New">Courier</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Comic Sans MS">Comic Sans MS</option>
                      <option value="Bitcount Single">Bitcount Single</option>
                      <option value="Indie Flower">Indie Flower</option>
                      <option value="Amatic SC">Amatic SC</option>
                    </select>

                    <select
                      onChange={(e) => {
                        if (e.target.value === "normal")
                          editor.chain().focus().unsetFontSize().run();
                        else
                          editor
                            .chain()
                            .focus()
                            .setFontSize(e.target.value)
                            .run();
                      }}
                      className="p-1.5 border border-gray-300 rounded-lg text-sm font-medium text-slate-700 bg-white outline-none cursor-pointer hover:border-primary min-w-17.5"
                    >
                      <option value="normal">Size</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                      <option value="24px">24px</option>
                      <option value="32px">32px</option>
                      <option value="64px">64px</option>
                    </select>
                  </div>
                  <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />
                  {/* 📋 Group 3: Lists & Alignment */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive("bulletList") ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                    >
                      <Icon icon="mdi:format-list-bulleted" width="20" />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive("orderedList") ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                    >
                      <Icon icon="mdi:format-list-numbered" width="20" />
                    </button>

                    {/* Alignment */}
                    <button
                      onClick={() =>
                        editor.chain().focus().setTextAlign("left").run()
                      }
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive({ textAlign: "left" }) ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                    >
                      <Icon icon="mdi:format-align-left" width="20" />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().setTextAlign("center").run()
                      }
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive({ textAlign: "center" }) ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                    >
                      <Icon icon="mdi:format-align-center" width="20" />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().setTextAlign("right").run()
                      }
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive({ textAlign: "right" }) ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                      title="Align Right"
                    >
                      <Icon icon="mdi:format-align-right" width="20" />
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                      }
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive("horizontalRule") ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                      title="Divider"
                    >
                      <Icon icon="mdi:minus" width="20" />
                    </button>
                  </div>
                  <div className="w-px h-6 bg-gray-200 mx-1 hidden lg:block" />
                  {/* 🎨 Group 4: Inserts & Colors */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="p-1.5 md:p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
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

                    <div
                      className={`relative flex items-center justify-center overflow-hidden p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive("textStyle") ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                      title="Text Color"
                    >
                      <Icon icon="mdi:format-color-text" width="20" />
                      <input
                        type="color"
                        onChange={(e) =>
                          editor.chain().focus().setColor(e.target.value).run()
                        }
                        className="absolute inset-0 w-[200%] h-[200%] -ml-[50%] -mt-[50%] opacity-0"
                      />
                    </div>

                    <button
                      onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                      }
                      className={`p-1.5 md:p-2 rounded-lg transition-colors ${editor.isActive("codeBlock") ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"}`}
                      title="Code Block"
                    >
                      <Icon icon="mdi:code-braces" width="20" />
                    </button>
                  </div>
                  <div className="flex-1" /> {/* ดันปุ่มที่เหลือไปทางขวาสุด */}
                  {/* 🗑️ Group 5: Clear */}
                  <button
                    onClick={() =>
                      editor.chain().focus().unsetAllMarks().clearNodes().run()
                    }
                    className="p-1.5 md:p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    title="Clear Formatting"
                  >
                    <Icon icon="mdi:format-clear" width="20" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full h-full flex flex-col lg:flex-row justify-center gap-10 bg-slate-50">
            <div className="flex-1 flex justify-center overflow-x-hidden no-scrollbar pb-10 px-2 sm:px-6 pt-4">
              <div
                id="note-content-container"
                className="prose prose-slate max-w-none shrink-0 bg-white border border-gray-200 shadow-sm p-4 sm:p-8 md:p-12 wrap-break-word cursor-text flex flex-col"
                style={{
                  width: "100%" /* ให้กางเต็มจอเมื่ออยู่บนมือถือ */,
                  maxWidth:
                    "210mm" /* ล็อกไม่ให้กว้างเกิน A4 เมื่ออยู่บนจอคอม */,
                  minHeight: "297mm" /* ล็อกความสูงขั้นต่ำให้เท่า A4 เสมอ */,
                }}
                onClick={() => editor?.commands.focus()}
              >
                <EditorContent
                  editor={editor}
                  /* บังคับตัว Tiptap ให้ยืดเต็มพื้นที่กระดาษ */
                  className="flex-1 w-full outline-none"
                  style={{ minHeight: "100%" }}
                />
              </div>
            </div>

            <button
              onClick={() => setIsOpenCommentModal(!isOpenCommentModal)}
              className="cursor-pointer absolute bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
            >
              <Icon
                icon={
                  isOpenCommentModal
                    ? "mdi:close"
                    : "mdi:comment-multiple-outline"
                }
                width="24"
              />
            </button>

            <div
              className={`
                /* 1. ควบคุมตำแหน่งให้อยู่ "เหนือ" ปุ่ม (bottom-24 คือเว้นระยะจากขอบล่าง 6rem) */
                absolute bottom-24 right-6 z-40 
                
                /* 2. ขนาดของกล่องแชท */
                w-[calc(100vw-3rem)] sm:w-95 /* มือถือเว้นขอบข้างละนิด, จอใหญ่กว้าง 380px */
                h-125 max-h-[70vh] /* สูง 500px แต่ไม่เกิน 75% ของความสูงหน้าจอ */
                
                /* 3. รูปแบบกล่อง */
                flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden
                
                /* 4. Animation: เด้งออกมาจากมุมขวาล่าง */
                transform origin-bottom-right transition-all duration-200 ease-out
                ${isOpenCommentModal ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"}
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 font-bold border-b border-gray-100 bg-gray-100">
                <div className="flex items-center gap-2 text-slate-800">
                  <Icon
                    icon="mdi:comment-multiple-outline"
                    className="text-primary"
                    width="22"
                  />
                  Comments
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 bg-white no-scrollbar">
                {(comments?.comments || comments || []).map((c, index) => {
                  const isMe = c?.sender?._id === user?._id;
                  const safeKey = c?._id || `comment-fallback-${index}`;

                  return (
                    <div
                      key={safeKey}
                      className={`flex w-full ${isMe ? "justify-end" : "justify-start"} py-2`}
                    >
                      <div
                        className={`max-w-[85%] border px-4 py-2 rounded-2xl shadow-sm flex flex-col ${
                          isMe
                            ? "bg-blue-50 border-blue-100 rounded-tr-sm"
                            : "bg-white border-gray-200 rounded-tl-sm"
                        }`}
                      >
                        {/* Meta: Avatar & Name */}
                        <div
                          className={`flex gap-2 items-center mb-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            style={{
                              borderColor: c?.sender?.avatar || "#e2e8f0",
                            }}
                            className="flex-none border-2 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm overflow-hidden"
                          >
                            <Icon
                              icon="mdi:account"
                              color={c?.sender?.avatar || "#94a3b8"}
                              width="24"
                            />
                          </div>
                          <div
                            className={`flex flex-col leading-tight ${isMe ? "items-end" : "items-start"}`}
                          >
                            <span className="font-bold text-xs text-slate-700">
                              {isMe ? "You" : c?.sender?.username || "Unknown"}
                            </span>
                            <span className="font-medium text-[10px] text-slate-400">
                              {formatChatTime(c.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div
                          style={{
                            borderColor: c?.sender?.avatar || "#cbd5e1",
                          }}
                          className={`text-sm text-slate-700 whitespace-pre-wrap wrap-break-word py-1 ${
                            isMe
                              ? "border-r-2 pr-3 text-right"
                              : "border-l-2 pl-3 text-left"
                          }`}
                        >
                          {c.type === "sticker" ? (
                            <img
                              src={`${import.meta.env.VITE_PATH_STICKERS}?nameImg=${c?.stickerUrl?.replace(".png", "")}`}
                              alt="sticker"
                              className="w-20 h-20 md:w-24 md:h-24 object-contain animate-in zoom-in duration-200"
                            />
                          ) : (
                            c.text
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                <div className="min-h-6">
                  {typingUserNames?.length > 0 && (
                    <span className="inline-block text-xs text-slate-500 font-medium italic bg-slate-200/60 px-3 py-1 rounded-full animate-pulse">
                      {typingUserNames.join(", ")}{" "}
                      {typingUserNames.length === 1 ? "is" : "are"} typing...
                    </span>
                  )}
                </div>

                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-gray-100 shrink-0 bg-slate-50">
                <ChatInput
                  value={typedMessage}
                  onChangeText={handleTypingChange}
                  onSend={handleSend}
                  onSendSticker={handleSendSticker}
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
