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
    let socket;

    if (user && user._id) {
      socket = connectSocket(user._id);

      socket.on("connect", () => {
        socket.emit("setup", user._id);
      });

      socket.on("new_notification", (data) => {
        // แสดง toast ตรงนี้
        addNotification(data);
      });

      // socket.on("transfer_ownership", ({ roomId, oldOwnerId, newOwnerId }) => {
      //   // แสดง toast ตรงนี้
      //   //addNotification(data);

      //   useRoomStore.setState((state) => {
      //     // 1. ค้นหาห้องปัจจุบันที่กำลังเปิดดูอยู่
      //     const currentRoom = state.myRooms.find((r) => r._id === roomId);
      //     if (!currentRoom) return state;

      //     // 2. จำลองหาข้อมูล User ของ Owner คนใหม่จากในระบบ (เพื่อคงความเป็น Object ของเจ้าของห้องไว้)
      //     // โดยการจิ้มหาข้อมูลคนนั้นจากในอาเรย์ members ที่เรามีอยู่แล้ว
      //     const newOwnerUserObj = currentRoom.members.find(
      //       (m) => m.user?._id === newOwnerId,
      //     )?.user || { _id: newOwnerId, username: "Ownerคนใหม่" }; // fallback ป้องกันพัง

      //     // 3. ปรับสิทธิ์ใน members: เปลี่ยนบทบาทของ Owner คนใหม่ให้เป็น editor (ตามลอจิกหลังบ้าน)
      //     const updatedMembers = currentRoom.members.map((m) =>
      //       m.user?._id === newOwnerId ? { ...m, role: "editor" } : m,
      //     );

      //     // 4. ประกอบร่างห้องชุดใหม่
      //     const newRoomData = {
      //       ...currentRoom,
      //       owner: newOwnerUserObj, // สลับก้อนข้อมูลเจ้าของห้องตัวจริง
      //       members: updatedMembers,
      //     };

      //     // 5. อัปเดตลงสโตร์หลักเพื่อสั่ง Re-render ยกแผง
      //     return {
      //       ...state,
      //       myRooms: state.myRooms.map((r) =>
      //         r._id === roomId ? newRoomData : r,
      //       ),
      //       rooms: state.rooms.map((r) => (r._id === roomId ? newRoomData : r)),
      //       recentRooms: state.recentRooms.map((r) =>
      //         r._id === roomId ? newRoomData : r,
      //       ),
      //       // ถ้ากำลังเปิดห้องนี้ค้างหน้าจออยู่ ให้เปลี่ยนทันตาเห็น
      //       roomData:
      //         state.roomData?._id === roomId ? newRoomData : state.roomData,
      //     };
      //   });
      // });

      socket.on("send_relative_time", ({ roomId, time }) => {
        setRelativeTime(roomId, time);
      });
    } else {
      //user (กด Logout) ให้ปิดท่อทันที
      disconnectSocket();
    }

    return () => {
      if (socket) {
        //ล้าง Event Listener ทุกตัวที่เคยผูกไว้ให้เกลี้ยง ป้องกันสเตทเบิ้ล
        socket.off("connect");
        socket.off("new_notification");
        //socket.off("transfer_ownership");
        socket.off("send_relative_time");
      }
      // สั่งปิดท่อหลักป้องกันสายค้าง
      disconnectSocket();
    };
  }, [user]);

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
          <Route
              path="/reset-password/:token/:email"
              element={<Login />}
            />
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
