import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
function Footer() {
  return (
    <>
      <div className="text-black w-full flex flex-col items-center gap-5 justify-center  pt-20 pb-5 h-auto bg-third">
        <div className="max-w-280 w-full flex flex-col justify-center items-center md:items-start  gap-15 md:gap-0 md:flex-row mb-15">
          <div className="flex flex-col items-center  md:items-start min-w-100 grow md:ps-20">
            <Link to="/">
              <img src="/logo.svg" alt="" className="w-60" />
            </Link>
            <span className="text-secondary font-semibold">
              Create and collaborate on notes with your team
            </span>
            <div className="flex items-end gap-2 mt-2">
              <Icon
                icon="fe:facebook"
                width="25"
                height="25"
                className="text-icon hover:scale-105 hover:text-primary transition-colors cursor-pointer"
              />
              <Icon
                icon="streamline-logos:tiktok-logo-block"
                width="24"
                height="24"
                className="text-icon hover:text-primary transition-colors cursor-pointer"
              />
              <Icon
                icon="streamline-logos:x-twitter-logo-block"
                width="24"
                height="24"
                className="text-icon hover:text-primary transition-colors cursor-pointer"
              />
              <Icon
                icon="streamline-logos:telegram-logo-1-block"
                width="24"
                height="24"
                className="text-icon hover:text-primary transition-colors cursor-pointer"
              />
              <Icon
                icon="ion:logo-linkedin"
                width="25"
                height="25"
                className="text-icon hover:text-primary transition-colors cursor-pointer"
              />
            </div>
          </div>
          <div className="text-secondary font-semibold flex flex-col text-center leading-7 min-w-25 w-full max-w-50">
            <span className="text-black ">Product</span>
            <HashLink
              to="/#feature"
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Feature
            </HashLink>
            <HashLink
              to="/#how-it-works"
              className="hover:text-primary transition-colors cursor-pointer"
            >
              How it works
            </HashLink>
            <HashLink
              to="/#pricing"
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Pricing
            </HashLink>
            <span className="hover:text-primary transition-colors cursor-pointer">
              API
            </span>
          </div>
          <div className="text-secondary font-semibold flex flex-col text-center leading-7 min-w-25 w-full max-w-50">
            <span className="text-black">Resource</span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Docs
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Blog
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              FAQ
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Terms
            </span>
          </div>
          <div className="text-secondary font-semibold flex flex-col text-center leading-7 min-w-25 w-full max-w-50">
            <span className="text-black">Company</span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Contact
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Social
            </span>
          </div>
        </div>
        <span className="text-secondary font-semibold block">
          @2026 Notes Together. all rights reserved
        </span>
      </div>
    </>
  );
}

export default Footer;
