import { Outlet } from "react-router-dom";
import Topbar from "../components/topbar";
import Sidebar from "../components/sidebar";

function DashboardLayout() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <header className="h-20 flex-none bg-white border-b z-10">
        <Topbar />
      </header>

      <div className=" flex flex-1 overflow-hidden">
        <aside className="w-60 flex-none h-full border-r">
          <Sidebar />
        </aside>

        <main className="flex-1 h-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
