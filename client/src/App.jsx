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

function App() {
  const { deleteModal, closeDeleteModal } = useModalStore();
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setRoomOnlineCount = useRoomStore((state) => state.setRoomOnlineCount);
  const setRelativeTime = useRoomStore((state) => state.setRelativeTime);
  const getNotifications = useNotificationStore(
    (state) => state.getNotifications,
  );
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  //socket
  useEffect(() => {
    // 🚩 ประกาศตัวแปรไว้ด้านนอก เพื่อให้ฟังก์ชัน return ด้านล่างเรียกใช้ล้างท่อได้
    let socket;

    if (user && user._id) {
      socket = connectSocket(user._id);

      socket.on("connect", () => {
        socket.emit("setup", user._id);
      });

      socket.on("new_notification", (data) => {
        console.log("Noti:", data);
        // แสดง toast ตรงนี้
        addNotification(data);
      });

      socket.on("room_status", ({ roomId, onlineCount, activeUsers }) => {
        setRoomOnlineCount(roomId, onlineCount, activeUsers);
      });

      socket.on("send_relative_time", ({ roomId, time }) => {
        setRelativeTime(roomId, time);
      });
    } else {
      //user (กด Logout) ให้ปิดท่อทันที
      disconnectSocket();
    }

    // รวมฟังก์ชัน Cleanup ไว้ที่ก้อนท้ายสุดก้อนเดียว สะอาด ปลอดภัย 100%
    return () => {
      if (socket) {
        //ล้าง Event Listener ทุกตัวที่เคยผูกไว้ให้เกลี้ยง ป้องกันสเตทเบิ้ล
        socket.off("connect");
        socket.off("new_notification");
        socket.off("room_status");
        socket.off("send_relative_time");
      }
      // สั่งปิดท่อหลักป้องกันสายค้าง
      disconnectSocket();
    };
  }, [user]); // รันใหม่ทุกครั้งที่สถานะผู้ใช้เปลี่ยน (Login / Logout)// ทำงานใหม่ทุกครั้งที่ค่า user เปลี่ยน

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
        </Route>

        {/* private */}
        <Route element={<ProtectedRoute />}>
          <Route path="/notes-together" element={<DashboardLayout />}>
            {/* 1. Static Routes (หน้าคงที่) */}
            <Route index element={<Explore />} />
            <Route path="explore" element={<Explore />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="recent" element={<Recent />} />
            <Route path="trash" element={<Trash />} />
            <Route path="join-link/:roomId/:role" element={<JoinLink />} />

            {/* 2. Setting Account (จัดการโปรไฟล์) */}
            <Route
              path=":id/setting-account"
              element={<SettingAccountLayout />}
            >
              <Route index element={<SettingAccountProfile />} />
              <Route path="profile" element={<SettingAccountProfile />} />
            </Route>

            {/* 3. Setting Room (จัดการห้อง - ใช้ :id) */}
            <Route path=":id/setting-room" element={<SettingRoomLayout />}>
              <Route index element={<SettingRoomGeneral />} />
              <Route path="general" element={<SettingRoomGeneral />} />
              <Route path="member" element={<SettingRoomMember />} />
              <Route path="share" element={<SettingRoomShare />} />
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
