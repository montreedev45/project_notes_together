import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useParams } from "react-router-dom";
import DeleteAccountModal from "./deleteAccountModal";

function SettingAccountSidebar() {
  const { id } = useParams();
  const [isOpenDeleteAccountModal, setIsOpenDeleteAccountModal] =
    useState(false);

  return (
    <>
      <div className="p-4 md:p-6 border-b-2 md:border-b-0 md:border-r-2 border-gray-200 bg-gray-50 md:bg-transparent shrink-0 md:w-64">
        <span className="text-xl md:text-2xl font-semibold hidden md:flex items-center gap-2 mb-4 md:ps-2">
          <Icon icon="mdi:user" className="text-black" width="40" />
          Account
        </span>
        <ul className="flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar text-sm md:text-base text-secondary font-semibold md:border-t-2 md:border-gray-200 md:pt-4">
          <Link
            to={`/notes-together/${id}/setting-account/profile`}
            className="shrink-0"
          >
            <li className="hover:text-black cursor-pointer transition-colors rounded-lg hover:bg-blue-100 p-2 md:p-3 text-center md:text-left capitalize">
              Profile
            </li>
          </Link>

          <Link
            to={`/notes-together/${id}/setting-account/plan`}
            className="shrink-0"
          >
            <li className="hover:text-black cursor-pointer transition-colors rounded-lg hover:bg-blue-100 p-2 md:p-3 text-center md:text-left capitalize">
              Plan
            </li>
          </Link>

          <li className="w-full flex justify-end md:justify-start md:mt-4">
            <button
              onClick={() => setIsOpenDeleteAccountModal(true)}
              className="w-full text-left text-red-500 hover:text-red-600 cursor-pointer transition-colors rounded-lg hover:bg-red-100 p-2.5 xl:p-3 capitalize"
            >
              Delete Account
            </button>
            <DeleteAccountModal
              isOpen={isOpenDeleteAccountModal}
              onClose={() => setIsOpenDeleteAccountModal(false)}
            />
          </li>
        </ul>
      </div>
    </>
  );
}

export default SettingAccountSidebar;
