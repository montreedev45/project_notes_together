import { useState } from "react";
import { HashLink } from "react-router-hash-link";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="w-full flex justify-center px-6 md:px-20 fixed top-0 left-0 backdrop-blur-xl z-50 bg-third/80">
      <nav className="w-full max-w-7xl h-16 md:h-20 flex items-center justify-between">
        
        {/* 1. Logo Section */}
        <div>
          <HashLink to="" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/logo.svg" alt="Notes Together" className="w-40 md:w-56" />
          </HashLink>
        </div>

        {/* 2. Desktop Menu (แสดงเฉพาะจอใหญ่) */}
        <div className="hidden lg:block">
          <ul className="flex justify-end items-center gap-10 navbar-style">
            <li>
              <HashLink to="/#feature" className="hover:text-primary transition-colors font-medium text-gray-700">Feature</HashLink>
            </li>
            <li>
              <HashLink to="/#how-it-works" className="hover:text-primary transition-colors font-medium text-gray-700">How it works</HashLink>
            </li>
            <li>
              <HashLink to="/#pricing" className="hover:text-primary transition-colors font-medium text-gray-700">Pricing</HashLink>
            </li>
            <li>
              <HashLink to="/login" className="hover:text-primary transition-colors font-medium text-gray-700">Login</HashLink>
            </li>
            <li>
              <HashLink to="/sign-up">
                <button className="button-primary px-6 py-2 rounded-lg hover:scale-105 transition-transform font-medium  cursor-pointer">
                  Sign up
                </button>
              </HashLink>
            </li>
          </ul>
        </div>

        {/* 3. Mobile Hamburger Button (แสดงเฉพาะจอเล็ก) */}
        <div className="block lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-primary focus:outline-none cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* 4. Mobile Dropdown Menu (Smooth Animation) */}
      <div 
        className={`absolute top-full left-0 w-full bg-white shadow-lg lg:hidden flex flex-col px-6 overflow-hidden transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen 
            ? "max-h-125 py-4 opacity-100 border-t border-gray-100 visible" 
            : "max-h-0 py-0 opacity-0 border-transparent invisible"
        }`}
      >
        <HashLink to="/#feature" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-primary py-2 font-medium">Feature</HashLink>
        <HashLink to="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-primary py-2 font-medium">How it works</HashLink>
        <HashLink to="/#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-primary py-2 font-medium">Pricing</HashLink>
        <hr className="border-gray-200 my-2" />
        <HashLink to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center font-medium text-gray-700 py-2">Login</HashLink>
        <HashLink to="/sign-up" onClick={() => setIsMobileMenuOpen(false)} className="w-full mt-2">
          <button className="w-full button-primary py-3 rounded-lg font-medium">Sign up</button>
        </HashLink>
      </div>
    </div>
  );
}