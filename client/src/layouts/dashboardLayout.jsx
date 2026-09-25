import { Outlet } from "react-router-dom";
import Topbar from "../components/topbar";
import Sidebar from "../components/sidebar";
import { useState } from "react";
import useAuthStore from "../store/useAuthStore";

function DashboardLayout() {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-3 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-50">
      <header className="h-20 flex-none bg-white border-b z-20 relative">
        <Topbar
          isOpen={isSidebarMobileOpen}
          onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
        />
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarMobileOpen(false)}
          />
        )}

        <aside
          className={`absolute lg:relative z-50 h-full bg-white transition-transform duration-300 ease-in-out w-50 md:w-60 border-r-2 border-gray-200
            ${isSidebarMobileOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:translate-x-0`}
        >
          <Sidebar onClose={() => setIsSidebarMobileOpen(false)} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto relative w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
