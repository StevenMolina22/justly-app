"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DisputesList } from "@/components/disputes/DisputesList";
import { Search, Archive, Filter } from "lucide-react";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";

export default function DisputesExplorerPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FC]">
      {/* 1. Clean Header (No User Balance) */}
      <div className="pt-4 px-4 pb-2">
        <DisputeOverviewHeader
          onBack={() => router.back()}
          title="Protocol Archive"
        />
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="px-5 py-2 sticky top-0 z-10 bg-[#F8F9FC]/95 backdrop-blur-sm">
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Title or Address..."
            className="flex-1 bg-transparent text-sm font-bold text-[#1b1c23] placeholder:text-gray-300 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <Filter className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* 3. The Full List (including Resolved) */}
      <div className="px-5 pb-2 pt-4">
        <div className="flex items-center gap-2 mb-1">
          <Archive className="w-4 h-4 text-[#8c8fff]" />
          <h3 className="text-base font-bold text-[#1b1c23]">All Disputes</h3>
        </div>
      </div>

      {/* TODO: You would ideally pass 'searchQuery' to DisputesList
        or filter client-side within DisputesList
      */}
      <DisputesList mode="all" />
    </div>
  );
}
