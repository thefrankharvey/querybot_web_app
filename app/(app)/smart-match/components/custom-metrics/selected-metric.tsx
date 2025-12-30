import { XIcon } from "lucide-react";
import React from "react";

const SelectedMetric = ({
  value,
  handleRemove,
}: {
  value: string;
  handleRemove: () => void;
}) => {
  return (
    <div
      className="flex items-center gap-1 bg-[#E2E8F1] rounded-full p-2 w-fit cursor-pointer"
      onClick={handleRemove}
    >
      <span className="text-xs font-medium">{value}</span>
      <XIcon className="size-4" />
    </div>
  );
};

export default SelectedMetric;
