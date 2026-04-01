import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

function Layout() {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="w-full flex justify-center">
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
}

export default Layout;
