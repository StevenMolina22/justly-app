import { Loader2, Shuffle } from "lucide-react";

export default function JurorAssignLoading() {
  return (
    <div className="flex flex-col flex-1 bg-gray-50 items-center justify-center gap-6">
      <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-500/10 animate-[spin_3s_linear_infinite]" />
        <Shuffle className="w-10 h-10 text-indigo-600 animate-pulse relative z-10" />
      </div>
      <p className="text-gray-500 font-medium">Connecting to protocol...</p>
    </div>
  );
}
