"use client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, User, Users, Settings, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";

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

export default function ProfilePage() {
  const router = useRouter();

  return (
    <Tabs
      defaultValue="overview"
      className="flex flex-col flex-1 bg-[#F8F9FC] overflow-hidden"
    >
      {/* --- Sticky Header --- */}
      <DisputeOverviewHeader
        onBack={() => router.push("/disputes")}
        title="My Profile"
      >
        {/* Navigation Pills */}
        <TabsList className="w-full bg-white h-auto p-1 rounded-2xl border border-gray-200 shadow-sm flex">
          <TabsTrigger
            value="overview"
            className="flex-1 gap-2 rounded-xl py-2.5 data-[state=active]:bg-[#1b1c23] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-xs text-gray-500"
          >
            <User className="w-4 h-4" />
            Overview
          </TabsTrigger>

          <TabsTrigger
            value="contacts"
            className="flex-1 gap-2 rounded-xl py-2.5 data-[state=active]:bg-[#1b1c23] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-xs text-gray-500"
          >
            <Users className="w-4 h-4" />
            Contacts
          </TabsTrigger>

          <TabsTrigger
            value="settings"
            className="flex-1 gap-2 rounded-xl py-2.5 data-[state=active]:bg-[#1b1c23] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-xs text-gray-500"
          >
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>
      </DisputeOverviewHeader>

      {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pt-2 scrollbar-hide">
          <TabsContent
            value="overview"
            className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <ProfileOverview />
          </TabsContent>

          <TabsContent
            value="contacts"
            className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <ContactsView />
          </TabsContent>

          <TabsContent
            value="settings"
            className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <SettingsView />
          </TabsContent>
        </div>
    </Tabs>
  );
}
