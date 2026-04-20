import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

function Topbar() {
  const user = useAuthStore((state=> state.user))
  const [isOpenNotificationModal, setIsOpenNotificationModal] = useState(false);
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
          <div className="flex items-center gap-3 me-5 cursor-pointer hover:scale-105 transition-transform">
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-bold text-sm truncate text-slate-800">
                {user?.username}
              </span>
            </div>
            <div style={{borderColor: user?.avatar}} className={`flex-none bg-white border-2  w-10 h-10 rounded-full flex items-center justify-center cursor-pointer`}>
              <Icon icon="mdi:account" style={{color: user?.avatar}}  width="30" />
            </div>
          </div>
          <Icon
            onClick={() => setIsOpenNotificationModal(!isOpenNotificationModal)}
            icon="mdi:bell"
            className="cursor-pointer hover:scale-105 transition-transform text-secondary"
            width="30"
          />
          {isOpenNotificationModal && (
            <>
              <div className="relative bg-green  right-85 top-8 z-50 select-none">
                <div className="absolute w-90 h-60 bg-white border border-slate-200 rounded-xl shadow-lg">
                  <div className="absolute right-6 -top-2 w-5 h-5 bg-gray-200 -rotate-45"></div>
                  <div className="px-4 py-2 text-xl font-medium border-b-2 border-gray bg-gray-200 rounded-tl-lg rounded-tr-lg">
                    <span>notification</span>
                  </div>

                  <ul className="relative mt-1.5 h-45 overflow-auto z-10 flex flex-col gap-1">
                    <li className="flex justify-between items-center p-3">
                      <div className="grow flex items-center font-medium text-md gap-2">
                        <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                          <Icon
                            icon="mdi:account"
                            className="text-primary"
                            width="20"
                          />
                        </div>
                        <span>montree.dev</span>
                      </div>
                      <span className="grow-0 text-right text-md text-secondary font-medium">joined room</span>
                      <span className="ps-4 grow-0 text-right text-md text-gray font-normal">5 min ago</span>
                    </li>
                    <li className="flex justify-between items-center p-3">
                      <div className="grow flex items-center font-medium text-md gap-2">
                        <div className="flex-none bg-white border-2 border-red w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                          <Icon
                            icon="mdi:account"
                            className="text-red"
                            width="20"
                          />
                        </div>
                        <span>john.dev</span>
                      </div>
                      <span className="grow-0 text-right text-md text-secondary font-medium">joined room</span>
                      <span className="ps-4 grow-0 text-right text-md text-gray font-normal">8 min ago</span>
                    </li>
                    <li className="flex justify-between items-center p-3">
                      <div className="grow flex items-center font-medium text-md gap-2">
                        <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                          <Icon
                            icon="mdi:account"
                            className="text-orange"
                            width="20"
                          />
                        </div>
                        <span>peter.dev</span>
                      </div>
                      <span className="grow-0 text-right text-md text-secondary font-medium">joined room</span>
                      <span className="ps-4 grow-0 text-right text-md text-gray font-normal">9 min ago</span>
                    </li>
                    <li className="flex justify-between items-center p-3">
                      <div className="grow flex items-center font-medium text-md gap-2">
                        <div className="flex-none bg-white border-2 border-pink w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                          <Icon
                            icon="mdi:account"
                            className="text-pink"
                            width="20"
                          />
                        </div>
                        <span>ben.dev</span>
                      </div>
                      <span className="grow-0 text-right text-md text-secondary font-medium">joined room</span>
                      <span className="ps-4 grow-0 text-right text-md text-gray font-normal">10 min ago</span>
                    </li>
                    
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Topbar;
