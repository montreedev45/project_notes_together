import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

function Topbar() {
  return (
    <>
      <div className="bg-third flex px-15 h-20 border-b-2 border-gray-200">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="" className="w-60 cursor-pointer" />
        </Link>
        <div className=" flex justify-end items-center w-full">
          <div className="bg-white flex items-center me-10 rounded-xl relative">
            <Icon
              icon="mdi:search"
              width="20"
              height="20"
              className="absolute left-2 text-secondary cursor-pointer"
            />
            <input
              type="text"
              placeholder="search..."
              className="py-1 ps-9 rounded-4xl outline-0 font-medium text-secondary border-2 border-gray"
            />
          </div>
          <div className="flex items-center gap-3 me-5">
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-bold text-sm truncate text-slate-800">
                montree.dev
              </span>
            </div>
            <div className="flex-none bg-white border-2 border-primary w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
              <Icon icon="mdi:account" className="text-primary" width="30" />
            </div>
          </div>
          <Icon
            icon="mdi:bell"
            className="cursor-pointer hover:scale-105 transition-all text-secondary"
            width="30"
          />
        </div>
      </div>
    </>
  );
}

export default Topbar;
