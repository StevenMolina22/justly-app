"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { User, Users, Settings, Loader2 } from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";
import { cn } from "@/lib/utils";

// Loading skeleton for tab content
const TabLoadingSkeleton = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
  </div>
);

// Dynamic imports for tab content (only load when tab is active)
const ProfileOverview = dynamic(
  () =>
    import("@/components/profile/ProfileOverview").then((m) => ({
      default: m.ProfileOverview,
    })),
  { loading: () => <TabLoadingSkeleton /> },
);

const ContactsView = dynamic(
  () =>
    import("@/components/profile/ContactsView").then((m) => ({
      default: m.ContactsView,
    })),
  { loading: () => <TabLoadingSkeleton /> },
);

const SettingsView = dynamic(
  () =>
    import("@/components/profile/SettingsView").then((m) => ({
      default: m.SettingsView,
    })),
  { loading: () => <TabLoadingSkeleton /> },
);

type TabValue = "overview" | "contacts" | "settings";

// Custom tab button component (no Radix context needed)
const TabButton = ({
  value,
  activeTab,
  onSelect,
  icon: Icon,
  label,
}: {
  value: TabValue;
  activeTab: TabValue;
  onSelect: (value: TabValue) => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) => (
  <button
    onClick={() => onSelect(value)}
    className={cn(
      "flex-1 gap-2 rounded-xl py-2.5 flex items-center justify-center transition-all font-bold text-xs",
      activeTab === value
        ? "bg-[#1b1c23] text-white shadow-md"
        : "text-gray-500 hover:text-gray-700",
    )}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

// Tab navigation pills component for the header (controlled via props)
const ProfileTabsList = ({
  activeTab,
  onTabChange,
}: {
  activeTab: TabValue;
  onTabChange: (value: TabValue) => void;
}) => (
  <div className="w-full bg-white h-auto p-1 rounded-2xl border border-gray-200 shadow-sm flex">
    <TabButton
      value="overview"
      activeTab={activeTab}
      onSelect={onTabChange}
      icon={User}
      label="Overview"
    />
    <TabButton
      value="contacts"
      activeTab={activeTab}
      onSelect={onTabChange}
      icon={Users}
      label="Contacts"
    />
    <TabButton
      value="settings"
      activeTab={activeTab}
      onSelect={onTabChange}
      icon={Settings}
      label="Settings"
    />
  </div>
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  // Configure the header via the hook
  useHeader({
    title: "My Profile",
    showBack: true,
    children: (
      <ProfileTabsList activeTab={activeTab} onTabChange={setActiveTab} />
    ),
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ProfileOverview />
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ContactsView />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <SettingsView />
          </div>
        )}
      </div>
    </div>
  );
}
