import { Loader2 } from "lucide-react";

export default function DisputeLoading() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#F8F9FC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#8c8fff] w-8 h-8" />
        <p className="text-sm text-gray-500 font-medium">Loading dispute...</p>
      </div>
    </div>
  );
}
