import { Link, useSearchParams } from "react-router-dom";
import image_hero from "../assets/image_hero.png";

function Error500() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "/";
  console.log("url", from);
  const handleReload = () => {
    window.location.href = from;
  };
  return (
    <div className="w-full min-h-dvh flex justify-center items-center bg-third p-4 sm:p-8">
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
        <div className="flex justify-center p-4 md:p-10 w-full md:w-1/2">
          <img
            src={image_hero}
            alt="500 Internal Server Error"
            className="w-full max-w-75 md:max-w-125 object-contain"
          />
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-1/2">
          <span className="font-bold text-7xl md:text-9xl text-slate-800 mb-4 md:mb-6">
            500
          </span>
          <h1 className="font-bold text-3xl md:text-5xl text-slate-700 max-w-md mb-8 md:mb-10 leading-tight">
            Something went wrong on our side.
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <button
              onClick={handleReload}
              className="w-full sm:w-auto bg-secondary text-white font-semibold px-8 py-3.5 rounded-xl text-xl hover:bg-opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Retry
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto bg-primary text-white font-semibold px-8 py-3.5 rounded-xl text-xl hover:bg-opacity-90 active:scale-95 transition-all shadow-md text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Error500;
