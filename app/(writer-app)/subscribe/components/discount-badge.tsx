import Image from "next/image";

const DiscountBadge = () => {
  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center">
      <Image
        src="/burst_badge.svg"
        alt="Burst badge"
        width={180}
        height={180}
        className="absolute inset-0"
      />
      <span className="relative z-10 text-white font-bold text-xs text-center leading-tight">
        Best Deal!
      </span>
    </div>
  );
};

export default DiscountBadge;
