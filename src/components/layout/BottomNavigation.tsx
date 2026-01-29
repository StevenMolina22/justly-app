"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gavel, User, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNavigation = () => {
  const pathname = usePathname();

  // 1. Precise Hiding Logic
  // Hide nav on focused action flows where user needs to complete a task
  const hiddenPaths = [
    /^\/disputes\/\d+\/vote$/, // Voting flow
    /^\/disputes\/\d+\/reveal$/, // Reveal flow
    /^\/disputes\/\d+\/pay$/, // Payment flow
    /^\/disputes\/\d+\/evidence\/submit$/, // Evidence upload
    /^\/disputes\/create$/, // Dispute creation wizard
    /^\/juror\/assign$/, // Juror assignment
    /^\/juror\/stake$/, // Staking flow
    /^\/juror\/assigned\/\d+$/, // Assignment confirmation
  ];

  const shouldHide = hiddenPaths.some((pattern) =>
    pattern.test(pathname || ""),
  );
  if (shouldHide) return null;

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      // Matches "/" exactly
      activePattern: /^\/$/,
    },
    // {
    //   label: "Explore",
    //   href: "/disputes",
    //   icon: Search, // New Icon for the Explorer
    //   // Matches "/disputes" but NOT "/disputes/123" (handled by hiding logic anyway)
    //   activePattern: /^\/disputes$/,
    // },
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
      activePattern: /^\/juror\/tasks/,
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
        <div className="flex items-center justify-between px-6 h-16">
          {navItems.map((item) => {
            const isActive = item.activePattern.test(pathname || "");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 min-w-[3.5rem]",
                  // CHANGE: Use Slice Purple (#8c8fff) when active
                  isActive
                    ? "text-[#8c8fff]"
                    : "text-gray-600 hover:text-gray-800",
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-all duration-200",
                      // Keep the scale animation, but removed 'fill-current'
                      isActive && "scale-110",
                    )}
                    // Reduced active stroke width from 2.5 to 2
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] tracking-tight transition-all",
                    isActive ? "font-bold" : "font-medium",
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
