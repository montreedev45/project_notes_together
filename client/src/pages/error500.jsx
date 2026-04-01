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
    <div className="w-full h-dvh flex justify-center bg-third">
      <div className="max-w-300 w-full flex justify-center items-center px-20 mt-16 mb-20">
        <div className="p-10">
          <img src={image_hero} alt="" className="w-130" />
        </div>
        <div className="flex flex-col p-10 my-10 items-center text-center">
          <span className="font-bold text-9xl mb-10">500</span>
          <span className="font-bold text-5xl  max-w-80 mb-10">
            Something went wrong on our side
          </span>
          <Link
            onClick={handleReload}
            className="mb-5 button-primary bg-secondary text-white font-semibold px-10 py-3 rounded-lg text-2xl hover:scale-105 transition-transform"
          >
            Retry
          </Link>
          <Link
            to="/"
            className="button-primary bg-primary text-white font-semibold px-6 py-2 rounded-lg text-xl hover:scale-105 transition-transform"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Error500;
