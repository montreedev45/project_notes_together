import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Recent from "./pages/recent";
import Trash from "./pages/trash";
import SettingAccountLayout from "./layouts/settingAccountLayout";
import SettingAccountProfile from "./components/settingAccount-profile";

function App() {
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
        <Route path="/notes-together" element={<DashboardLayout />}>
          <Route index element={<Dashboard/>}/>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="recent" element={<Recent />} />
          <Route path="trash" element={<Trash />} />

          //Editor
          <Route path=":id/editor" element={<Editor roomId="69c22a40c269a4b7f2b3942b"/>} />

          //Setting Room
          <Route path=":id/setting-room" element={<SettingRoomLayout />}>
            <Route index element={<SettingRoomGeneral />} />
            <Route path="general" element={<SettingRoomGeneral />} />
            <Route path="member" element={<SettingRoomMember />} />
          </Route>

          //Setting Account
          <Route path=":id/setting-account" element={<SettingAccountLayout />}>
            <Route index element={<SettingAccountProfile />} />
            <Route path="profile" element={<SettingAccountProfile />} />
          </Route>

        </Route>

        <Route path="*" element={<Error404 />} />
        <Route path="/500" element={<Error500 />} />
      </Routes>
    </>
  );
}

export default App;
