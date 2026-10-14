import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import DeleteRoomModal from "./components/deleteRoomModal";
import useModalStore from "./store/useModalStore";
import useAuthStore from "./store/useAuthStore";
import useRoomStore from "./store/useRoomStore";
import useNotificationStore from "./store/useNotificationStore";

import { connectSocket, disconnectSocket } from "./socket";
import { Toaster } from "react-hot-toast";

// กลุ่มนี้คือโครงสร้างหลักและหน้า Landing Page (Home) ต้องโหลดมาพร้อมกับเบราว์เซอร์ทันที
import Layout from "./layouts/layout";
import Home from "./pages/home";
import ProtectedRoute from "./components/protectedRoute";

// Lazy Load (แยกไฟล์ JS ออกไป โหลดเมื่อผู้ใช้กดเปลี่ยนหน้าเท่านั้น)
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/register"));

// กลุ่ม Dashboard & Layouts
const DashboardLayout = lazy(() => import("./layouts/dashboardLayout"));
const Explore = lazy(() => import("./pages/explore"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Recent = lazy(() => import("./pages/recent"));
const Trash = lazy(() => import("./pages/trash"));
const JoinLink = lazy(() => import("./pages/join-link"));

// กลุ่ม Settings
const SettingAccountLayout = lazy(
  () => import("./layouts/settingAccountLayout"),
);
const SettingAccountProfile = lazy(
  () => import("./components/settingAccount-profile"),
);
const SettingAccountPlan = lazy(
  () => import("./components/settingAccount-plan"),
);
const SettingRoomLayout = lazy(() => import("./layouts/settingRoomLayout"));
const SettingRoomGeneral = lazy(
  () => import("./components/settingRoom-general"),
);
const SettingRoomMember = lazy(() => import("./components/settingRoom-member"));
const SettingRoomShare = lazy(() => import("./components/settingRoom-share"));
const SettingRoomTransferOwnership = lazy(
  () => import("./components/settingRoom-transferOwnership"),
);

const Editor = lazy(() => import("./components/editor"));

// กลุ่ม Error
const Error404 = lazy(() => import("./pages/error404"));
const Error500 = lazy(() => import("./pages/error500"));

function App() {
  const { deleteModal, closeDeleteModal } = useModalStore();
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setRelativeTime = useRoomStore((state) => state.setRelativeTime);
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
      //console.log("Socket connected:", socket.id);
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
  }, [user?._id]); // แนะนำให้ใส่ dependency เป็น user?._id เพื่อป้องกัน re-run ถ้านาฬิกา/state อื่นใน object user เปลี่ยน

  useEffect(() => {
    const saveRecent = JSON.parse(localStorage.getItem("recent-rooms") || "[]");
    useRoomStore.setState({ recentRooms: saveRecent });
    checkAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center select-none pointer-events-none">
        <div className="animate-spin rounded-full h-15 w-15 border-t-3 border-primary"></div>
      </div>
    );
  }
  return (
    <>
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <Routes>
          {/* public */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<Register />} />
            <Route path="/reset-password/:token/:email" element={<Login />} />
          </Route>

          {/* private */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
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
              {/* URL: /room123/editor */}
              <Route path=":roomId/:role" element={<Editor />} />
            </Route>
          </Route>

          <Route path="*" element={<Error404 />} />
          <Route path="/500" element={<Error500 />} />
        </Routes>
      </Suspense>
      <DeleteRoomModal
        isOpen={deleteModal.isOpen}
        roomId={deleteModal.roomId}
        onClose={closeDeleteModal}
      />

      <Toaster
        position="top-center"
        containerClassName="select-none pointer-events-none"
        toastOptions={{
          duration: 3000,
          success: {
            style: { background: "#ecfdf5", color: "#065f46" },
          },
          error: {
            style: { background: "#fef2f2", color: "#991b1b" },
          },
        }}
      />
    </>
  );
}

export default App;
