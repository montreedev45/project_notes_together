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
      <div className="pt-6">
        <span className="text-2xl font-semibold flex items-center gap-2 ps-3">
          <Icon icon="mdi:user" className="text-black" width="60" />
          Account
        </span>
        <ul className="grow text-md text-secondary font-semibold border-t-2 border-gray me-5 mt-3 pt-3 px-2 flex flex-col">
          <li className="hover:text-black cursor-pointer transition-all rounded-lg hover:bg-blue-200 p-3">
            <Link to={`/notes-together/${id}/setting-account/profile`}>
              profile
            </Link>
          </li>
          <li>
            <button
              onClick={() => setIsOpenDeleteAccountModal(true)}
              className="w-full text-start hover:text-red-700 cursor-pointer transition-all rounded-lg hover:bg-red p-3"
            >
              delete account
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
