"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gavel, User, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNavigation = () => {
  const pathname = usePathname();

  // Hide on specific detailed flows to focus user attention
  const hideOnPaths = [
    "/disputes/", // Hide on nested dispute routes (e.g., /disputes/1/vote)
    "/juror/stake",
    "/juror/assign",
    "/juror/assigned",
  ];

  const shouldHide = hideOnPaths.some((path) => {
    if (path === "/disputes/") {
      // Hide on /disputes/[id]/* but not on /disputes or /disputes/create
      return (
        pathname?.startsWith("/disputes/") &&
        pathname !== "/disputes/create" &&
        /^\/disputes\/\d+/.test(pathname)
      );
    }
    return pathname?.startsWith(path);
  });

  if (shouldHide) return null;

  const navItems = [
    {
      label: "Home",
      href: "/disputes",
      icon: Home,
      activePattern: /^\/disputes$|^\/$/,
    },
    {
      label: "My Cases",
      href: "/manage",
      icon: LayoutGrid,
      activePattern: /^\/manage/,
    },
    {
      label: "Tasks",
      href: "/juror/tasks",
      icon: Gavel,
      activePattern: /^\/juror/,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      activePattern: /^\/profile/,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = item.activePattern.test(pathname || "");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-3 transition-colors active:scale-95",
                isActive ? "text-[#1b1c23]" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive && "fill-current"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#8c8fff] rounded-full" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] tracking-tight",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        </div>
      </div>
    </div>
  );
};
