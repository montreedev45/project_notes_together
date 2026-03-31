import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link"
function Navbar() {
  return (
    <div className="w-full flex justify-center md:px-20">
      <nav className="w-7xl h-navbar flex items-center">
        <div className="">
          <HashLink to=""><img src="/logo.svg" alt="" className="w-70" /></HashLink>
        </div>
        <div className="grow lg:block hidden">
          <ul className=" flex justify-end items-center gap-10 navbar-style">
            <HashLink to="/#feature" className="hover:text-primary transition-colors">
              <li>Feature</li>
            </HashLink>
            <HashLink to="/#how-it-works" className="hover:text-primary transition-colors">
              <li className="w-30">How it works</li>
            </HashLink>
            <HashLink to="/#pricing" className="hover:text-primary transition-colors">
              <li>Pricing</li>
            </HashLink>
            <HashLink to="/login" className="hover:text-primary transition-colors">
              <li>Login</li>
            </HashLink>
            <HashLink to="/sign-up" className="">
              <li className="button-primary w-30 hover:scale-105 transition-transform">Sign up</li>
            </HashLink>
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
