import { useState } from "react";
import { Icon } from "@iconify/react";

function SettingRoomMember() {
  const [isCopied, setIsCopied] = useState(false);

  const link = "https://notes-together/0/editor";
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };
  return (
    <>
      <div className=" border-s-2 border-gray px-15 pt-9 flex flex-col gap-8">
        <div className="flex flex-col gap-3 relative">
          <div className="flex gap-5">
            <span className="text-2xl font-semibold">Share Link</span>
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
              readOnly
              value={link}
              className="flex-1 py-2 outline-none px-4 text-lg rounded-lg border-2 border-gray text-secondary"
            />

            <button
              onClick={handleCopy}
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
            >
              {isCopied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <div className=" gap-3 relative">
          <span className="flex  justify-between text-2xl font-semibold">
            Add Member
            <div className="bg-white flex items-center rounded-xl relative">
              <Icon
                icon="mdi:search"
                width="20"
                height="20"
                className="absolute left-2 text-secondary cursor-pointer"
              />
              <input
                type="text"
                value="peter"
                readOnly
                className="w-60 py-1 ps-9 rounded-4xl outline-0 font-normal text-black border-2 border-gray text-lg "
              />
            </div>
          </span>
          <div className="flex items-center justify-between mt-3">
            <div className=" flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
              <div className="flex-none bg-white border-2 border-primary w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-bold text-sm truncate text-slate-800">
                  peter.dev
                </span>
                <span className="font-normal text-xs text-secondary truncate">
                  peter.dev@gmail.com
                </span>
              </div>
            </div>
            <div className="flex gap-3">
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
              <button
                onClick={handleCopy}
                className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white  px-4 py-1 rounded-lg font-semibold transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        <div className=" flex flex-col gap-2 relative">
          <span className="flex  justify-between text-2xl font-semibold">
            Members (3)
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
                className="w-60 py-1 ps-9 rounded-4xl outline-0 font-semibold text-secondary border-2 border-gray text-lg "
              />
            </div>
          </span>
          <div className=" flex items-center justify-between mt-3">
            <div className="grow flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
              <div className="flex-none bg-white border-2 border-primary w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                <Icon icon="mdi:account" className="text-primary" width="30" />
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
              <span className="w-3 h-3 rounded-full bg-green-500"></span>online
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
                <Icon icon="mdi:account" className="text-green" width="30" />
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-bold text-sm truncate text-slate-800 flex gap-2">
                  peter.dev
                  <Icon
                    icon="mdi:star"
                    width="20"
                    className="text-yellow-300"
                  />
                  owner
                </span>
                <span className="font-normal text-xs text-secondary truncate">
                  peter.dev@gmail.com
                </span>
              </div>
            </div>
            <div className="flex-none flex gap-3 items-center me-25">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>online
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
                <option value="commenter">
                  Commenter
                </option>
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
              <span className="w-3 h-3 rounded-full bg-green-500"></span>online
            </div>
            <div className="flex-none flex gap-3">
              <select
                name="permission"
                id=""
                className="cursor-pointer px-2 outline-0 rounded-lg border-2 border-gray text-md font-semibold text-secondary"
              defaultValue="viewer"
              >
                <option value="editor">Editor</option>
                <option value="viewer">
                  Viewer
                </option>
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
    </>
  );
}
export default SettingRoomMember;
