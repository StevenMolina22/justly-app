import React from "react";
import ConnectButton from "../ConnectButton";
import Link from "next/link";
import { IconLogo } from "@/components/IconLogo";

export const DisputesHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center w-full pt-6 px-5 overflow-hidden box-border">
      <Link href="/disputes" className="cursor-pointer">
        <IconLogo className="h-14 w-14 max-w-[60%] hover:opacity-80 transition-opacity text-zinc-900 dark:text-white" />
      </Link>

      <div className="flex items-center gap-3">
        <ConnectButton />
      </div>
    </div>
  );
};
