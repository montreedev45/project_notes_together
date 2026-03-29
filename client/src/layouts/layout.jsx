import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";

function Layout() {
  return (
    <div className="layout-container">
      <Navbar />
      {/* <div style={{ display: "flex" }}>
        <aside
          className="sidebar"
          style={{
            backgroundColor: "#83ff6a",
            width: "200px",
            height: "600px",
          }}
        >
          Sidebar
        </aside>
      </div> */}
      <main className="w-full flex justify-center">
        <Outlet />
        </main>
      {/* <footer
        className="footer"
        style={{ height: "80px", backgroundColor: "#32aeea" }}
      >
        Footer
      </footer> */}
    </div>
  );
}

export default Layout;
