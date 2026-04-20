import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import useAuthStore from "../store/useAuthStore";

function Sidebar() {
  const logout = useAuthStore((state)=> state.logout)
  const user = useAuthStore((state)=> state.user)

  const handleLogout=()=>{
    logout()
  }

  return (
    <div className="w-60 h-full border-r-2 border-gray-200 flex flex-col justify-between py-8 px-6 bg-third">
      <nav>
        <ul className="flex flex-col gap-6 text-secondary font-medium">
          <li className="cursor-pointer hover:text-primary transition-colors">
            <Link
              to="/notes-together/dashboard"
              className="flex gap-4 items-center"
            >
              <Icon icon="mdi:home" width="24" />
              <span>My Rooms</span>
            </Link>
          </li>
          <li className="cursor-pointer hover:text-primary transition-colors">
            <Link
              to="/notes-together/recent"
              className="flex gap-4 items-center"
            >
              <Icon icon="mdi:clock" width="24" />
              <span>Recent</span>
            </Link>
          </li>
          <li className="cursor-pointer hover:text-primary transition-colors">
            <Link
              to="/notes-together/trash"
              className="flex gap-4 items-center"
            >
              <Icon icon="mdi:trash" width="24" />
              <span>Trash</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
          <div className="flex-none bg-white border-2 border-primary w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
            <Icon icon="mdi:account" className="text-primary" width="24" />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="font-bold text-sm truncate text-slate-800">
              {user.username}
            </span>
            <span className="font-normal text-xs text-secondary truncate">
              {user.email}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 text-secondary font-medium ">
          <Link to="/notes-together/01/setting-account" className="flex items-center gap-4 cursor-pointer hover:text-primary transition-colors">
            <Icon icon="mdi:cog" width="30" />
            <span>Settings</span>
          </Link>
          <Link to="/" onClick={handleLogout} className="flex items-center gap-4 cursor-pointer hover:text-red-500 transition-colors">
            <Icon icon="mdi:log-out" width="30" />
            <span>Log out</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
