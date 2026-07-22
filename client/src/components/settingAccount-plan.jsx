import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import usePlanStore from "../store/usePlanStore";

function SettingAccountPlan() {
  const user = useAuthStore((state) => state.user);
  const plans = usePlanStore((state) => state.plans);

  const getPlan = usePlanStore((state) => state.getPlan);
  const upgradePlan = usePlanStore((state) => state.upgradePlan);

  const plansReverse = [...plans].reverse();

  useEffect(() => {
    getPlan();
  }, []);

  const handleSelectPlan = (planId, planName) => {
    if (window.confirm(`do you want to change to the ${planName} plan?`)) {
      upgradePlan(planId);
    }
  };

  return (
    <>
      <div className="px-15 pt-9 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center flex-col lg:gap-20 lg:flex-row mt-10">
            {plansReverse.map((p) => (
              <div
                key={p._id}
                className="min-w-90 p-10 lg:min-w-70 w-fit h-110 lg:h-90 rounded-lg shadow-xl lg:p-5 border-2 border-slate-200 hover:scale-105 transition-transform cursor-pointer"
              >
                <span className="py-1 px-4 rounded-lg font-medium text-white bg-primary">
                  {p.plan}
                </span>
                <span className="text-black block py-5 font-bold text-3xl">
                  ${p.price} / month
                </span>
                <Link
                  onClick={() => handleSelectPlan(p._id, p.plan)}
                  className={`${user.plan === p.plan ? " bg-gray-200 border-2 border-gray-300 text-gray-300" : "button-primary bg-primary"} py-2 rounded-md font-medium block w-full text-center cursor-pointer`}
                >
                  {user.plan === p.plan ? "Your plan" : "Get started"}
                </Link>
                <div className="flex flex-col justify-start pt-5">
                  {p.description.map((d) => (
                    <span key={Math.random()} className="flex">
                      <Icon
                        icon="fluent-emoji-high-contrast:check-mark"
                        className="text-primary"
                        width="20"
                        height="20"
                      />
                      <span className="ps-2 font-medium">{d}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingAccountPlan;
