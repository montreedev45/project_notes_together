import { Icon } from "@iconify/react";

function Sidebar() {
  return (
    <div className="w-60 h-full border-r-2 border-gray-200 flex flex-col justify-between py-8 px-6 bg-third">
      <nav>
        <ul className="flex flex-col gap-6 text-secondary font-medium">
          <li className="flex items-center gap-4 cursor-pointer hover:text-primary transition-colors">
            <Icon icon="mdi:home" width="24" />
            <span>My Rooms</span>
          </li>
          <li className="flex items-center gap-4 cursor-pointer hover:text-primary transition-colors">
            <Icon icon="mdi:clock" width="24" />
            <span>Recent</span>
          </li>
          <li className="flex items-center gap-4 cursor-pointer hover:text-primary transition-colors">
            <Icon icon="mdi:trash" width="24" />
            <span>Trash</span>
          </li>
        </ul>
      </nav>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="flex-none bg-white border-2 border-primary w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
            <Icon icon="mdi:account" className="text-primary" width="24" />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="font-bold text-sm truncate text-slate-800">montree.dev</span>
            <span className="font-normal text-xs text-secondary truncate">
              test.dev@gmail.com
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-secondary font-medium cursor-pointer hover:text-primary transition-colors">
          <Icon icon="mdi:cog" width="30" />
          <span>Settings</span>
        </div>
      </div>

    </div>
  );
}

export default Sidebar;