import { Link } from "react-router-dom";
import image_hero from "../assets/image_hero.png";

function Error404() {
  return (
    <div className="w-full h-dvh flex justify-center bg-third">
      <div className="max-w-300 w-full flex justify-center items-center px-20 mt-16 mb-20">
        <div className="p-10">
          <img src={image_hero} alt="" className="w-130" />
        </div>
        <div className="flex flex-col p-10 my-10 items-center text-center">
          <span className="font-bold text-9xl mb-10">404 </span>
          <span className="font-bold text-5xl  max-w-80 mb-10">
            Oops! This page doesn’t exist
          </span>
          <Link to="/" className="button-primary text-white font-semibold px-10 py-3 rounded-lg text-2xl hover:scale-105 transition-transform">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Error404;
