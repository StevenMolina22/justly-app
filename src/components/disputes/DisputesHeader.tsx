import React from "react";
import ConnectButton from "../ConnectButton";
import Link from "next/link";
import { JustlyIconOutline } from "@/components/logos/JustlyIcon";

export const DisputesHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center w-full py-4 px-5 overflow-hidden box-border">
      <Link
        href="/disputes"
        className="cursor-pointer flex items-center shrink-0"
      >
        <JustlyIconOutline className="size-11 shrink-0 hover:opacity-80 transition-opacity" />
      </Link>

      <div className="flex items-center gap-3">
        <ConnectButton />
      </div>
    </div>
  );
};
