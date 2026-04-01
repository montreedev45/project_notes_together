import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <>
      <Routes>
        {/* public */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* <Route path="editor/:id" element={<Editor roomId="69c132eab358289d365fc24b"/>}/> */}

          <Route path="/login" element={<Login/>}/>
          <Route path="/sign-up" element={<Register/>}/>


        </Route>

        {/* private */}
        <Route path="/notes-together" element={<DashboardLayout/>}>
          <Route path="/notes-together/dashboard" element={<Dashboard/>}/>
        </Route>

        <Route path="*" element={<Error404/>}/>
        <Route path="/500" element={<Error500/>}/>
      </Routes>
    </>
  );
}

export default App;
