import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import image_hero from "../assets/image_hero.png";
import image_step_1 from "../assets/notes_together_step1.png";
import image_step_2 from "../assets/notes_together_step2.png";
import image_step_3 from "../assets/notes_together_step3.png";
import api from "../services/api";

function Home() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-full bg-third flex justify-center pb-55 pt-35 h-195">
        <div className="w-fit flex items-center px-10">
          <div className="grow justify-center lg:items-start items-center flex flex-col text-center lg:text-left">
            <h1 className="font-bold text-logo w-120 lg:w-70 leading-12">
              Write Notes Together in Real Time
            </h1>
            <p className="w-100 mt-5 text-secondary font-semibold">
              Create a shared workspace for your team. Start a room, invite
              collaborators, and edit notes together in real time.
            </p>
            <button className="button-primary mt-5 font-semibold">
              Create Your Frist Room
            </button>
          </div>
          <div className="hidden lg:block min-w-fit">
            <img src={image_hero} alt="" className="" />
          </div>
        </div>
      </div>

      <div className="text-black w-full flex justify-center  pt-25 h-150">
        <div className="w-300 ">
          <p className="font-bold text-logo text-center">Features</p>
          <div className="flex pt-15 justify-between">
            <div className="bg-third rounded-lg w-65 h-auto p-5 flex justify-center items-center flex-col text-center shadow-xl">
              <Icon
                icon="wpf:online"
                className="text-primary bg-white rounded-full my-1 p-2"
                width="60"
                height="60"
              />
              <h5 className="font-semibold text-2xl">
                Real-time collaboration
              </h5>
              <p className="p-1 pt-3 leading-5 text-secondary font-semibold">
                Edit notes together with live updates from everyone in the room.
              </p>
            </div>
            <div className="bg-third rounded-lg w-65 h-auto p-5 flex justify-center items-center flex-col text-center shadow-xl">
              <Icon
                icon="mdi:people-add"
                className="text-primary bg-white rounded-full my-1 p-2"
                width="60"
                height="60"
              />
              <h5 className="font-semibold text-2xl">Room based workspace</h5>
              <p className="p-1 pt-3 leading-5 text-secondary font-semibold">
                Organize notes by rooms for projects, teams, or study sessions.
              </p>
            </div>
            <div className="bg-third rounded-lg w-65 h-auto p-5 flex justify-center items-center flex-col text-center shadow-xl">
              <Icon
                icon="fa6-solid:share"
                className="text-primary bg-white rounded-full my-1 p-2"
                width="60"
                height="60"
              />
              <h5 className="font-semibold text-2xl w-40">
                Share note with link
              </h5>
              <p className="p-1 pt-3 leading-5 text-secondary font-semibold">
                Invite collaborators instantly by sharing a simple room link.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-black w-full flex justify-center  py-25 h-fit">
        <div className="w-300 px-50">
          <p className="font-bold text-logo text-center">How it works</p>
          <div className=" mt-8 flex flex-col gap-30">
            <div className=" flex justify-between h-80">
              <div className="bg-third rounded-lg w-80 h-auto p-5 flex justify-center items-center flex-col text-center shadow-xl">
                <Icon
                  icon="ph:number-one-bold"
                  className="text-white bg-primary rounded-full my-2 p-2"
                  width="60"
                  height="60"
                />
                <h5 className="font-semibold text-2xl w-46">
                  Create workspace room
                </h5>
                <p className="px-2 w-65 pt-3 leading-5 text-secondary font-semibold">
                  Start a new room for your project or study session. Each room
                  has its own shared notes.
                </p>
              </div>
              <div>
                <img src={image_step_1} className="h-full shadow-xl" alt="" />
              </div>
            </div>

            <div className=" flex justify-between h-80">
              <div>
                <img src={image_step_2} className="h-full shadow-xl" alt="" />
              </div>
              <div className="bg-third rounded-lg w-80 h-auto p-5 flex justify-center items-center flex-col text-center shadow-xl">
                <Icon
                  icon="ph:number-two-bold"
                  className="text-white bg-primary rounded-full my-2 p-2"
                  width="60"
                  height="60"
                />
                <h5 className="font-semibold text-2xl w-46">
                  Invite others to join
                </h5>
                <p className="px-2 w-65 pt-3 leading-5 text-secondary font-semibold">
                  Share the room link with teammates so they can join and
                  collaborate instantly.
                </p>
              </div>
            </div>

            <div className="flex justify-between h-80">
              <div className="bg-third rounded-lg w-80 h-auto p-5 flex justify-center items-center flex-col text-center shadow-xl">
                <Icon
                  icon="ph:number-three-bold"
                  className="text-white bg-primary rounded-full my-2 p-2"
                  width="60"
                  height="60"
                />
                <h5 className="font-semibold text-2xl w-46">
                  Edit notes in real time
                </h5>
                <p className="px-2 w-65 pt-3 leading-5 text-secondary font-semibold">
                  Everyone in the room can write and edit notes at the same time
                  with live updates.
                </p>
              </div>
              <div>
                <img src={image_step_3} className="h-full shadow-xl" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-black w-full flex justify-center  py-25 h-auto bg-third">
        <div className="w-300 px-30">
          <p className="font-bold text-logo text-center">Pricing</p>
          <div className=" flex justify-between items-center mt-10">
            <div className="bg-white w-60 h-80 rounded-lg shadow-xl p-5">
              <span className="py-1 px-4 rounded-lg font-medium text-white bg-secondary">
                Free Plan
              </span>
              <span className="text-black block py-5 font-bold text-3xl">
                $0 / month
              </span>
              <button className="button-primary bg-secondary py-2 rounded-md font-medium w-full">
                Current plan
              </button>
              <div className="flex justify-start pt-5">
                <Icon
                  icon="fluent-emoji-high-contrast:check-mark"
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">3 project</span>
              </div>
              <div className="flex justify-start">
                <Icon
                  icon="fluent-emoji-high-contrast:check-mark"
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">3 notes per project</span>
              </div>
              <div className="flex justify-start">
                <Icon
                  icon="fluent-emoji-high-contrast:check-mark"
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">
                  1 colleague per project
                </span>
              </div>
            </div>

            <div className="bg-white w-65 h-90 rounded-lg shadow-xl p-5">
              <span className="py-1 px-4 rounded-lg font-medium text-white bg-primary">
                Teams Plan
              </span>
              <span className="text-black block py-5 font-bold text-3xl">
                $10 / month
              </span>
              <button className="button-primary bg-primary py-2 rounded-md font-medium w-full">
                Get started
              </button>
              <div className="flex justify-start pt-5">
                <Icon
                  icon="fluent-emoji-high-contrast:check-mark"
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">6 project</span>
              </div>
              <div className="flex justify-start">
                <Icon
                  icon="fluent-emoji-high-contrast:check-mark"
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">9 notes per project</span>
              </div>
              <div className="flex justify-start">
                <Icon
                  icon="fluent-emoji-high-contrast:check-mark"
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">
                  6 colleague per project
                </span>
              </div>
            </div>

            <div className="bg-white w-60 h-80 rounded-lg shadow-2xl p-5">
              <span className="py-1 px-4 rounded-lg font-medium text-white bg-primary">
                Business Plan
              </span>
              <span className="text-black block py-5 font-bold text-3xl">
                $100 / month
              </span>
              <button className="button-primary bg-primary py-2 rounded-md font-medium w-full">
                Get started
              </button>
              <div className="flex justify-start pt-5">
                <Icon
                  icon="fluent-emoji-high-contrast:check-mark"
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">unlimit project</span>
              </div>
              <div className="flex justify-start">
                <Icon
                  icon="fluent-emoji-high-contrast:check-mark"
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">unlimit notes</span>
              </div>
              <div className="flex justify-start">
                <Icon
                  icon="fluent-emoji-high-contrast:check-mark"
                  className="text-primary"
                  width="20"
                  height="20"
                />
                <span className="ps-2 font-medium">unlimit colleague</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-black w-full flex justify-center  py-40 h-auto">
        <div className="w-300 flex flex-col justify-center items-center gap-6">
          <p className="font-bold text-logo text-center w-180 text-primary ">Start collaborating today Create your first room in seconds</p>
          <button className="button-primary w-fit font-semibold">Create Your First Room</button>
        </div>
      </div>

      <div className="text-black w-full flex flex-col items-center gap-5 justify-center  pt-20 pb-5 h-auto bg-third">
        <div className="w-280 flex mb-15">
          <div className="flex flex-col items-start grow ps-20">
            <img src="/logo.svg" alt="" className="w-60"/>
            <span className="text-secondary font-semibold">Create and collaborate on notes with your team</span>
            <div className="flex items-end gap-2 mt-2">
              <Icon icon="fe:facebook" width="25" height="25" className="text-icon"/>
              <Icon icon="streamline-logos:tiktok-logo-block" width="24" height="24" className="text-icon"/>
              <Icon icon="streamline-logos:x-twitter-logo-block" width="24" height="24" className="text-icon"/>
              <Icon icon="streamline-logos:telegram-logo-1-block" width="24" height="24" className="text-icon"/>
              <Icon icon="ion:logo-linkedin" width="25" height="25" className="text-icon"/>
            </div>
          </div>
          <div className="text-secondary font-semibold flex flex-col text-center leading-7  w-50">
            <span className="text-black">Product</span>
            <span>Feature</span>
            <span>Pricing</span>
            <span>API</span>
          </div>
          <div className="text-secondary font-semibold flex flex-col text-center leading-7 w-50">
            <span className="text-black">Resource</span>
            <span>Docs</span>
            <span>Blog</span>
            <span>FAQ</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
          <div className="text-secondary font-semibold flex flex-col text-center leading-7  w-50">
            <span className="text-black">Company</span>
            <span>Contact</span>
            <span>Social</span>
          </div>
        </div>
        <span className="text-secondary font-semibold block">@2026 Notes Together. all rights reserved</span>
      </div>
    </div>
  );
}

export default Home;
