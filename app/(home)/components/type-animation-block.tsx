import React from "react";
import { TypeAnimation } from "react-type-animation";

const TypeAnimationBlock = ({
  setShowSecondAnimation,
  showSecondAnimation,
}: {
  setShowSecondAnimation: (show: boolean) => void;
  showSecondAnimation: boolean;
}) => {
  return (
    <div className="pt-15 md:pt-20 sm:w-[90%] md:w-full lg:w-full text-left">
      <h1 className="text-3xl md:text-[50px] font-normal leading-tight text-accent">
        <TypeAnimation
          className="block h-[170px] md:h-[300px] whitespace-pre-line"
          speed={50}
          sequence={[
            `Smart.\n Author Focused Tools.\nQuery Smart.\nGet Signed.\nKeep Writing.`,
            1000,
            () => setShowSecondAnimation(true),
          ]}
          repeat={0}
          omitDeletionAnimation={true}
        />
      </h1>

      <div>
        <p className="text-lg md:text-xl mt-8 h-[28px]">
          {showSecondAnimation && (
            <TypeAnimation
              className="block h-[28px] whitespace-pre-line text-accent"
              sequence={[`Built by Authors. Powered by Rejection.`, 0.5]}
              repeat={0}
              omitDeletionAnimation={true}
              cursor={false}
            />
          )}
        </p>
      </div>
    </div>
  );
};

export default TypeAnimationBlock;
