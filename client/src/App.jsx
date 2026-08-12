import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Editor from "./components/editor";
import Profile from "./components/profile";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Layout from "./layouts/layout";
import DashboardLayout from "./layouts/dashboardlayout";
import Error404 from "./pages/error404";
import Error500 from "./pages/error500";
import Dashboard from "./pages/dashboard";
import SettingRoomLayout from "./layouts/settingRoomLayout";
import SettingRoomGeneral from "./components/settingRoom-general";
import SettingRoomMember from "./components/settingRoom-member";
import SettingRoomShare from "./components/settingRoom-share";
import Recent from "./pages/recent";
import Trash from "./pages/trash";
import SettingAccountLayout from "./layouts/settingAccountLayout";
import SettingAccountProfile from "./components/settingAccount-profile";
import Explore from "./pages/explore";
import DeleteRoomModal from "./components/deleteRoomModal";
import ProtectedRoute from "./components/protectedRoute";
import useModalStore from "./store/useModalStore";
import useAuthStore from "./store/useAuthStore";
import useRoomStore from "./store/useRoomStore";

import JoinLink from "./pages/join-link";
import { connectSocket, disconnectSocket } from "./socket";
import useNotificationStore from "./store/useNotificationStore";
import SettingRoomTransferOwnership from "./components/settingRoom-transferOwnership";
import SettingAccountPlan from "./components/settingAccount-plan";

function App() {
  const { deleteModal, closeDeleteModal } = useModalStore();
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  //const setRoomOnlineCount = useRoomStore((state) => state.setRoomOnlineCount);
  const setRelativeTime = useRoomStore((state) => state.setRelativeTime);
  const getNotifications = useNotificationStore(
    (state) => state.getNotifications,
  );
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  //socket
  useEffect(() => {
    // 1. ถ้าไม่มี user หรือลบ account ออกไปแล้ว ให้ตัดสายทันที
    if (!user?._id) {
      disconnectSocket();
      return;
    }

    // 2. ถ้ามี user ให้ดึง/สร้าง socket instance
    const socket = connectSocket(user._id);

    // --- Handlers ---
    const handleConnect = () => {
      //console.log("⚡ Socket connected:", socket.id);
      socket.emit("setup", user._id);
    };

    const handleNewNotification = (data) => {
      addNotification(data);
    };

    const handleRelativeTime = ({ roomId, time }) => {
      setRelativeTime(roomId, time);
    };

    // --- Bind Event Listeners ---
    socket.on("connect", handleConnect);
    socket.on("new_notification", handleNewNotification);
    socket.on("send_relative_time", handleRelativeTime);

    // Trigger หาก Socket เชื่อมต่ออยู่แล้วก่อนที่ Listener จะผูกเสร็จ
    if (socket.connected) {
      handleConnect();
    }

    // --- Cleanup Function ---
    // จะทำงานเมื่อ Component Unmount หรือ user._id เปลี่ยนแปลง
    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_notification", handleNewNotification);
      socket.off("send_relative_time", handleRelativeTime);
    };
  }, [user?._id]); // 👈 แนะนำให้ใส่ dependency เป็น user?._id เพื่อป้องกัน re-run ถ้านาฬิกา/state อื่นใน object user เปลี่ยน

  useEffect(() => {
    const saveRecent = JSON.parse(localStorage.getItem("recent-rooms") || "[]");
    useRoomStore.setState({ recentRooms: saveRecent });
    checkAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }
  return (
    <>
      <Routes>
        {/* public */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* <Route path="editor/:id" element={<Editor roomId="69c132eab358289d365fc24b"/>}/> */}

          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<Register />} />
          <Route path="/reset-password/:token/:email" element={<Login />} />
        </Route>

        {/* private */}
        <Route element={<ProtectedRoute />}>
          <Route path="/notes-together" element={<DashboardLayout />}>
            {/* 1. Static Routes (หน้าคงที่) */}
            <Route index element={<Explore />} />
            <Route path="explore" element={<Explore />} />
            <Route path="myroom" element={<Dashboard />} />
            <Route path="recent" element={<Recent />} />
            <Route path="trash" element={<Trash />} />
            <Route
              path="join-link/:shareLinkToken/:role"
              element={<JoinLink />}
            />

            {/* 2. Setting Account (จัดการโปรไฟล์) */}
            <Route
              path=":id/setting-account"
              element={<SettingAccountLayout />}
            >
              <Route index element={<SettingAccountProfile />} />
              <Route path="profile" element={<SettingAccountProfile />} />
              <Route path="plan" element={<SettingAccountPlan />} />
            </Route>

            {/* 3. Setting Room (จัดการห้อง - ใช้ :id) */}
            <Route path=":id/setting-room" element={<SettingRoomLayout />}>
              <Route index element={<SettingRoomGeneral />} />
              <Route path="general" element={<SettingRoomGeneral />} />
              <Route path="member" element={<SettingRoomMember />} />
              <Route path="share" element={<SettingRoomShare />} />
              <Route
                path="transfer-ownership"
                element={<SettingRoomTransferOwnership />}
              />
            </Route>

            {/* 4. Editor (Dynamic สุด ย้ายมาไว้ล่างสุด) */}
            {/* URL: /notes-together/room123/editor */}
            <Route path=":roomId/:role" element={<Editor />} />
          </Route>
        </Route>

        <Route path="*" element={<Error404 />} />
        <Route path="/500" element={<Error500 />} />
      </Routes>
      <DeleteRoomModal
        isOpen={deleteModal.isOpen}
        roomId={deleteModal.roomId}
        onClose={closeDeleteModal}
      />
    </>
  );
}

export default App;
