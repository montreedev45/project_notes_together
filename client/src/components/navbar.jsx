import { Link } from "react-router-dom";
function Navbar() {
  return (
    <div className="w-full flex justify-center md:px-20">
      <nav className="w-7xl h-navbar flex items-center">
        <div className="">
          <img src="/logo.svg" alt="" className="w-70" />
        </div>
        <div className="grow lg:block hidden">
          <ul className=" flex justify-end items-center gap-10 navbar-style">
            <Link to="/">
              <li>Feature</li>
            </Link>
            <Link to="">
              <li className="w-30">How it works</li>
            </Link>
            <Link to="">
              <li>Pricing</li>
            </Link>
            <Link to="">
              <li>Login</li>
            </Link>
            <Link to="">
              <li className="button-primary w-30">Sign up</li>
            </Link>
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
