import { Icon } from "@iconify/react";
import facebook from "@iconify-icons/mdi/facebook";
import linkedin from "@iconify-icons/mdi/linkedin";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

function Footer() {
  return (
    <>
      <div className="text-black w-full flex flex-col items-center gap-5 justify-center px-10 pt-20 pb-5 h-auto bg-third">
        <div className="max-w-280 w-full flex flex-col justify-center items-center md:items-start gap-10 md:gap-0 md:flex-row mb-15">
          <div className="flex flex-col items-center text-center md:text-start gap-2 md:items-start w-full md:ps-15">
            <Link to="/">
              <img
                src="/logo.svg"
                alt="Notes Together"
                width="224"
                height="60"
                className="w-40 md:w-56 h-auto"
              />
            </Link>
            <span className="text-gray-600 font-semibold">
              Create and collaborate on notes with your team
            </span>
            <div className="flex items-end gap-3 mt-2">
              <a href="#" aria-label="Facebook" className="text-gray-600 hover:text-primary hover:scale-105 transition-all">
                <Icon
                  icon={facebook}
                  width="25"
                  height="25"
                />
              </a>

              <a href="#" aria-label="LinkedIn" className="text-gray-600 hover:text-primary hover:scale-105 transition-all">
                <Icon
                  icon={linkedin}
                  width="25"
                  height="25"
                />
              </a>
            </div>
          </div>
          
          <div className="text-gray-700 font-semibold flex flex-col text-center leading-7 min-w-25 w-full max-w-40">
            <span className="text-black font-bold mb-1">Product</span>
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

          <div className="text-gray-700 font-semibold flex flex-col text-center leading-7 min-w-25 w-full max-w-40">
            <span className="text-black font-bold mb-1">Resource</span>
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

          <div className="text-gray-700 font-semibold flex flex-col text-center leading-7 min-w-25 w-full max-w-40">
            <span className="text-black font-bold mb-1">Company</span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Contact
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Social
            </span>
          </div>
        </div>
        
        <span className="text-gray-600 font-normal block mb-2">
          @2026 Notes Together. all rights reserved
        </span>
      </div>
    </>
  );
}

export default Footer;