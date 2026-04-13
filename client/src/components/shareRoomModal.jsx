import { Icon } from "@iconify/react";
function ShareRoomModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-third w-full max-w-3xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
            <h2 className="text-xl font-semibold text-slate-800">share room</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
            >
              <Icon icon="mdi:close" width="24" className="text-slate-500" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-15 pt-8 space-y-10">
            <div className="flex flex-col gap-3 relative">
              <div className="flex gap-5">
                <span className="text-xl font-semibold">Share Link</span>
                <select
                  name="permission"
                  id=""
                  className="cursor-pointer px-2 outline-0 rounded-lg border-2 border-gray text-md font-semibold text-secondary"
                >
                  <option value="editor" defaultValue>
                    Editor
                  </option>
                  <option value="viewer">Viewer</option>
                  <option value="viewer">Commenter</option>
                </select>
                <select
                  name="people-with-access"
                  id=""
                  className="cursor-pointer px-2 outline-0 rounded-lg border-2 border-gray text-md font-semibold text-secondary"
                >
                  <option value="anyone" defaultValue>
                    Anyone with link
                  </option>
                  <option value="reader">Only invited people</option>
                  <option value="viewer">Restricted</option>
                </select>
              </div>
              <div className="flex gap-5 items-center ">
                <input
                  type="text"
                  value="https://notes-together/01"
                  readOnly
                  className="h-10 flex-1 py-2 outline-none px-4 text-lg rounded-lg border-2 border-gray text-secondary"
                />

                <button className="h-10 flex items-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
                  Copy
                </button>
              </div>
            </div>

            <div className="gap-3 relative">
              <div className="flex gap-5 items-center text-lg font-semibold mb-3">
                Invite People
                <div className="flex gap-3 h-8">
                  <select
                    name="permission"
                    className="cursor-pointer px-2 outline-0 rounded-lg border-2 border-gray-300 text-sm font-semibold text-secondary bg-white"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                    <option value="commenter">Commenter</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <input
                  type="text"
                  placeholder="Email"
                  className="h-10 flex-1 py-2 outline-none px-4 text-lg rounded-lg border-2 border-gray-300 text-secondary"
                />
                <button className="flex items-center h-10 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
                  Send
                </button>
              </div>
            </div>

            <div className=" flex flex-col gap-2 relative">
              <span className="flex  justify-between text-lg font-semibold">
                Members
                <div className="bg-white flex items-center rounded-xl relative">
                  <Icon
                    icon="mdi:search"
                    width="20"
                    height="20"
                    className="absolute left-2 text-secondary cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="search member"
                    className="w-60 h-8 py-1 ps-9 rounded-4xl outline-0 font-semibold text-secondary border-2 border-gray text-[14px] "
                  />
                </div>
              </span>
              <div className=" flex items-center justify-between mt-3">
                <div className="grow flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
                  <div className="flex-none bg-white border-2 border-primary w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                    <Icon
                      icon="mdi:account"
                      className="text-primary"
                      width="30"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="font-bold text-sm truncate text-slate-800 flex gap-2">
                      montree.dev
                      <Icon
                        icon="mdi:star"
                        width="20"
                        className="text-yellow-300"
                      />
                      owner
                    </span>
                    <span className="font-normal text-xs text-secondary truncate">
                      test.dev@gmail.com
                    </span>
                  </div>
                </div>
                <div className="flex-none flex gap-3 items-center me-25">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  online
                </div>
                <div className="flex-none flex gap-3">
                  <select
                    name="permission"
                    id=""
                    className="cursor-pointer px-2 outline-0 rounded-lg border-2 border-gray text-md font-semibold text-secondary"
                  >
                    <option value="editor" defaultValue>
                      Editor
                    </option>
                    <option value="viewer">Viewer</option>
                    <option value="viewer">Commenter</option>
                  </select>
                  <Icon
                    icon="mdi:trash"
                    className="text-secondary"
                    width="24"
                  ></Icon>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="grow flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
                  <div className="flex-none bg-white border-2 border-green w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                    <Icon
                      icon="mdi:account"
                      className="text-green"
                      width="30"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="font-bold text-sm truncate text-slate-800 flex gap-2">
                      peter.dev
                    </span>
                    <span className="font-normal text-xs text-secondary truncate">
                      peter.dev@gmail.com
                    </span>
                  </div>
                </div>
                <div className="flex-none flex gap-3 items-center me-25">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  online
                </div>
                <div className="flex-none flex gap-3">
                  <select
                    name="permission"
                    id=""
                    className="cursor-pointer px-2 outline-0 rounded-lg border-2 border-gray text-md font-semibold text-secondary"
                    defaultValue="commenter"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                    <option value="commenter">Commenter</option>
                  </select>
                  <Icon
                    icon="mdi:trash"
                    className="text-secondary"
                    width="24"
                  ></Icon>
                </div>
              </div>
              <div className=" flex items-center justify-between mt-3">
                <div className="grow flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
                  <div className="flex-none bg-white border-2 border-red w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                    <Icon icon="mdi:account" className="text-red" width="30" />
                  </div>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="font-bold text-sm truncate text-slate-800 flex gap-2">
                      john.dev
                    </span>
                    <span className="font-normal text-xs text-secondary truncate">
                      john.dev@gmail.com
                    </span>
                  </div>
                </div>
                <div className="flex-none flex gap-3 items-center me-25">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  online
                </div>
                <div className="flex-none flex gap-3">
                  <select
                    name="permission"
                    id=""
                    className="cursor-pointer px-2 outline-0 rounded-lg border-2 border-gray text-md font-semibold text-secondary"
                    defaultValue="viewer"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                    <option value="commenter">Commenter</option>
                  </select>
                  <Icon
                    icon="mdi:trash"
                    className="text-secondary"
                    width="24"
                  ></Icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ShareRoomModal;
