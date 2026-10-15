import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import accessPoint from "@iconify-icons/mdi/access-point";
import peopleAdd from "@iconify-icons/mdi/people-add";
import share from "@iconify-icons/mdi/share";
import number1 from "@iconify-icons/mdi/number-1-circle";
import number2 from "@iconify-icons/mdi/number-2-circle";
import number3 from "@iconify-icons/mdi/number-3-circle";
import check from "@iconify-icons/mdi/check-bold";

function Home() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-full bg-third flex justify-center py-30 min-[450px]:py-50 md:py-45 lg:py-70">
        <div className="w-full max-w-7xl flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-20 gap-10 md:gap-4">
          <div className="grow justify-center md:items-start items-center flex flex-col text-center md:text-left">
            <h1 className="font-bold text-gray-800 max-w-80 sm:max-w-lg md:leading-13 text-2xl min-[450px]:text-3xl md:text-5xl">
              Write Notes Together in Real Time
            </h1>
            <p className="min-w-sm max-w-sm px-10 my-3 text-gray-600 font-semibold md:px-1">
              Create a shared workspace for your team. Start a room, invite
              collaborators, and edit notes together in real time.
            </p>
            <Link
              to="/login"
              className="button-primary bg-blue-600 rounded-lg py-3 mt-4 font-bold hover:scale-105 transition-transform cursor-pointer block text-center text-white"
            >

              Create Your First Room
            </Link>
          </div>

          <div className="w-full flex justify-center md:justify-end md:block">
            <img
              src="/image_hero.webp"
              alt="Notes Together Hero"
              /* 1. แก้ LCP: สั่งให้เบราว์เซอร์ให้ความสำคัญสูงสุดกับรูปนี้ โหลดเป็นคิวแรกสุด */
              fetchPriority="high"
              /* 2. แก้ CLS: ใส่ขนาดความกว้าง/สูงตั้งต้น (ให้เปลี่ยนตัวเลขนี้เป็นขนาด Pixel จริงของรูปภาพ WebP ของคุณ) */
              width="645"
              height="435"
              /* 3. แก้ CLS & Responsive: ใช้ aspect-ratio จองพื้นที่ และ h-auto ป้องกันรูปเบี้ยว */
              className="w-70 min-[450px]:w-80 md:w-full h-auto object-contain aspect-4/3"
            />
          </div>
        </div>
      </div>

      <div className="text-black w-full flex justify-center h-fit" id="feature">
        <div className="w-fit h-fit py-30">
          <p className="font-bold  text-2xl min-[450px]:text-3xl md:text-5xl text-center">
            Features
          </p>
          <div className="flex flex-col pt-15 items-center justify-between lg:gap-20 gap-30 lg:flex-row">
            <div className="rounded-lg w-70 h-90 p-10 md:w-110 md:h-80 md:p-20 flex justify-center items-center flex-col text-center shadow-xl lg:w-80 lg:h-80 lg:p-5 hover:scale-105 transition-transform">
              <Icon
                icon={accessPoint}
                className="text-primary rounded-full my-1 p-2"
                width="60"
                height="60"
              />
              <h3 className="font-semibold text-2xl lg:w-40 text-center">
                Real-time collaboration
              </h3>
              <p className="p-1 pt-3 leading-5 text-gray-400 font-semibold lg:w-65">
                Edit notes together with live updates from everyone in the room.
              </p>
            </div>
            <div className="rounded-lg w-70 h-90 p-10 md:w-110 md:h-80 md:p-20 flex justify-center items-center flex-col text-center shadow-xl lg:w-80 lg:h-80 lg:p-5 hover:scale-105 transition-transform">
              <Icon
                icon={peopleAdd}
                className="text-primary rounded-full my-1 p-2"
                width="60"
                height="60"
              />
              <h3 className="font-semibold text-2xl lg:w-40 text-center">
                Room based workspace
              </h3>
              <p className="p-1 pt-3 leading-5 text-gray-400 font-semibold lg:w-65">
                Organize notes by rooms for projects, teams, or study sessions.
              </p>
            </div>
            <div className="rounded-lg w-70 h-90 p-10 md:w-110 md:h-80 md:p-20 flex justify-center items-center flex-col text-center shadow-xl lg:w-80 lg:h-80 lg:p-5 hover:scale-105 transition-transform">
              <Icon
                icon={share}
                className="text-primary rounded-full my-1 p-2"
                width="60"
                height="60"
              />
              <h3 className="font-semibold text-2xl lg:w-40 text-center">
                Share note with link
              </h3>
              <p className="p-1 pt-3 leading-5 text-gray-400 font-semibold lg:w-65">
                Invite collaborators instantly by sharing a simple room link.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="text-black w-full flex justify-center h-fit"
        id="how-it-works"
      >
        <div className="max-w-5xl w-full py-30">
          <p className="font-bold text-2xl min-[450px]:text-3xl md:text-5xl text-center">
            How it works
          </p>
          <div className=" mt-8 flex flex-col gap-30 pt-10">
            <div className="flex justify-center lg:justify-between h-80">
              <div className="rounded-lg w-70 h-90 px-15 md:w-110 md:h-80 flex justify-center items-center flex-col text-center shadow-xl lg:w-100 lg:h-80 lg:p-5 hover:scale-105 transition-transform">
                <Icon
                  icon={number1}
                  className="text-primary bg-white rounded-full my-2 "
                  width="60"
                  height="60"
                />
                <h3 className="font-semibold text-xl md:text-2xl max-w-46">
                  Create workspace room
                </h3>
                <p className="px-2 min-w-50 pt-3 leading-5 text-gray-400 font-semibold">
                  Start a new room for your project or study session. Each room
                  has its own shared notes.
                </p>
              </div>
              <div>
                <img
                  src="/notes_together_step1.webp"
                  alt="Step 1: Create a shared workspace"
                  loading="lazy"
                  width="600"
                  height="450"
                  className="hidden h-full shadow-xl lg:block lg:w-100 lg:h-80 lg:p-5 object-contain"
                />
              </div>
            </div>

            <div className=" flex justify-center lg:justify-between h-80">
              <div>
                <img
                  src="/notes_together_step2.webp"
                  alt="Step 2: Invite others to join"
                  loading="lazy"
                  width="600"
                  height="450"
                  className="hidden h-full shadow-xl lg:block lg:w-100 lg:h-80 lg:p-5 object-contain"
                />
              </div>
              <div className="rounded-lg w-70 h-90 p-10 md:w-110 md:h-80 flex justify-center items-center flex-col text-center shadow-xl lg:w-100 lg:h-80 lg:p-5 hover:scale-105 transition-transform">
                <Icon
                  icon={number2}
                  className="text-primary bg-white rounded-full my-2 "
                  width="60"
                  height="60"
                />
                <h3 className="font-semibold text-2xl w-46">
                  Invite others to join
                </h3>
                <p className="px-2 w-65 pt-3 leading-5 text-gray-400 font-semibold">
                  Share the room link with teammates so they can join and
                  collaborate instantly.
                </p>
              </div>
            </div>

            <div className="flex justify-center lg:justify-between h-80">
              <div className="rounded-lg w-70 h-90 p-10 md:w-110 md:h-80 flex justify-center items-center flex-col text-center shadow-xl lg:w-100 lg:h-80 lg:p-5 hover:scale-105 transition-transform">
                <Icon
                  icon={number3}
                  className="text-primary bg-white rounded-full my-2 "
                  width="60"
                  height="60"
                />
                <h3 className="font-semibold text-2xl w-46">
                  Edit notes in real time
                </h3>
                <p className="px-2 w-65 pt-3 leading-5 text-gray-400 font-semibold">
                  Everyone in the room can write and edit notes at the same time
                  with live updates.
                </p>
              </div>
              <div>
                <img
                  src="/notes_together_step3.webp"
                  alt="Step 3: Edit notes in real time"
                  loading="lazy"
                  width="600"
                  height="450"
                  className="hidden h-full shadow-xl lg:block lg:w-100 lg:h-80 lg:p-5 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="text-black w-full flex justify-center  h-auto bg-third"
        id="pricing"
      >
        <div className="w-full max-w-300 px-10 py-30">
          <p className="font-bold text-2xl min-[450px]:text-3xl md:text-5xl text-center">
            Pricing
          </p>
          <div className=" flex justify-between items-center flex-col gap-30 lg:flex-row mt-8 py-10">
            <div className="bg-white w-65 h-90 p-5 md:w-110 md:h-90 lg:w-70 lg:h-90 rounded-lg shadow-xl lg:p-5 hover:scale-105 transition-transform">
              <span className="py-1 px-4 rounded-lg font-bold text-white text-xs bg-blue-600 ">
                Free Plan
              </span>
              <span className="text-black block py-5 font-bold text-3xl">
                $0 / month
              </span>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-bold block w-full text-center cursor-pointer"
              >
                Get started
              </Link>
              <div className="flex justify-start pt-5">
                <Icon
                  icon={check}
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">3 rooms per account</span>
              </div>
              <div className="flex justify-start">
                <Icon
                  icon={check}
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">1 colleague per room</span>
              </div>
            </div>

            <div className="bg-white w-65 h-90 p-5 md:w-110 md:h-90 lg:w-70 lg:h-90 rounded-lg shadow-xl lg:p-5 hover:scale-105 transition-transform">
              <span className="py-1 px-4 rounded-lg font-bold text-white text-xs bg-blue-600 ">
                Teams Plan
              </span>
              <span className="text-black block py-5 font-bold text-3xl">
                $10 / month
              </span>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-bold block w-full text-center cursor-pointer"
              >
                Get started
              </Link>

              <div className="flex justify-start pt-5">
                <Icon
                  icon={check}
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">9 rooms per account</span>
              </div>
              <div className="flex justify-start">
                <Icon
                  icon={check}
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">6 colleagues per room</span>
              </div>
            </div>

            <div className="bg-white w-65 h-90 p-5 md:w-110 md:h-90 lg:w-70 lg:h-90 rounded-lg shadow-xl lg:p-5 hover:scale-105 transition-transform">
              <span className="py-1 px-4 rounded-lg font-bold text-white text-xs bg-blue-600 ">
                Business Plan
              </span>
              <span className="text-black block py-5 font-bold text-3xl">
                $100 / month
              </span>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-bold block w-full text-center cursor-pointer"
              >
                Get started
              </Link>

              <div className="flex justify-start pt-5">
                <Icon
                  icon={check}
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">unlimited rooms</span>
              </div>
              <div className="flex justify-start">
                <Icon
                  icon={check}
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">unlimited colleague</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center py-40 px-15 md:px-30 h-auto">
        <div className="max-w-200 w-fit flex flex-col justify-center items-center gap-6">
          <p className="font-bold text-3xl md:text-4xl lg:text-5xl leading-12 text-center w-full text-primary ">
            Start collaborating today Create your first room in seconds
          </p>
          <Link
            to="/login"
            className="button-primary bg-blue-700 rounded-lg py-3 mt-4 font-medium hover:scale-105 transition-transform cursor-pointer block text-center text-white"
          >
            Create Your First Room
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
