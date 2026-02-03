"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DisputesList } from "@/components/disputes/DisputesList";
import { Search, Archive, Filter } from "lucide-react";
import { useHeader } from "@/lib/hooks/useHeader";

// Search bar component for the header
const SearchBar = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) => (
  <div className="w-full">
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
);

export default function DisputesExplorerPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Configure header with search bar
  useHeader({
    title: "Protocol Archive",
    children: (
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
    ),
  });

  return (
    <div className="flex flex-col flex-1 w-full overflow-hidden">
      {/* 3. The Full List (including Resolved) */}
      <div className="px-5 pb-2 pt-4 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Archive className="w-4 h-4 text-[#8c8fff]" />
          <h3 className="text-base font-bold text-[#1b1c23]">All Disputes</h3>
        </div>
      </div>

      {/* Scrollable List Container */}
      <div className="flex-1 overflow-y-auto">
        {/* TODO: You would ideally pass 'searchQuery' to DisputesList
          or filter client-side within DisputesList
        */}
        <DisputesList mode="all" />
      </div>
    </div>
  );
}
