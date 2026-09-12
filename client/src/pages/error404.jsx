import { Link } from "react-router-dom";
import image_hero from "../assets/image_hero.png";

function Error404() {
  return (
    <div className="w-full min-h-dvh flex justify-center items-center bg-third p-4 sm:p-8">
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 mt-8 mb-16">
        <div className="flex justify-center p-4 md:p-10 w-full md:w-1/2">
          <img
            src={image_hero}
            alt="404 Not Found Illustration"
            className="w-full max-w-75 md:max-w-112.5 object-contain"
          />
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-1/2">
          <span className="font-bold text-7xl md:text-9xl text-slate-800 mb-4 md:mb-6 tracking-tight">
            404
          </span>
          <h1 className="font-bold text-3xl md:text-5xl text-slate-700 max-w-md mb-8 md:mb-10 leading-tight">
            Oops! This page doesn’t exist
          </h1>
          <Link
            to="/"
            className="button-primary bg-primary text-white font-semibold px-10 py-3.5 rounded-xl text-xl hover:bg-blue-600 active:scale-95 transition-all shadow-md text-center w-full sm:w-auto"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Error404;
