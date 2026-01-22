import React, { useState, useMemo } from "react";
import { DisputeCard } from "./DisputeCard";
import {
  BarChart3,
  Gavel,
  Loader2,
  Filter,
  Check,
  XCircle,
  Sparkles,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Dispute } from "@/hooks/disputes/useDisputeList";

// Categories matching your Create Dispute options
const FILTER_CATEGORIES = [
  { label: "General Court", value: "General" },
  { label: "Tech & Software", value: "Tech" },
  { label: "Freelance", value: "Freelance" },
  { label: "E-Commerce", value: "E-Commerce" },
];

interface Props {
  disputes: Dispute[];
  isLoading: boolean;
  onEarnClick: () => void;
}

export const DisputeListView: React.FC<Props> = ({
  disputes,
  isLoading,
  onEarnClick,
}) => {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  // Renamed to enable state updates
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter Logic
  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      const matchesTab = activeTab === "active" ? d.status < 3 : d.status === 3;

      // Robust matching: Check if the dispute category includes the selected filter value
      const matchesCategory = selectedCategory
        ? d.category.toLowerCase().includes(selectedCategory.toLowerCase())
        : true;

      return matchesTab && matchesCategory;
    });
  }, [disputes, activeTab, selectedCategory]);

  return (
    <div className="px-5 w-full box-border pb-4 relative">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-100 mb-6">
        {["active", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "pb-3 font-semibold capitalize transition-all",
              activeTab === tab
                ? "text-[#1b1c23] border-b-2 border-[#1b1c23]"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            {tab === "active" ? "Active Cases" : "Past History"}
          </button>
        ))}
      </div>

      {/* Header & Filter Row */}
      <div className="flex justify-between items-center mb-5 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md overflow-hidden bg-[#8c8fff] flex items-center justify-center">
            <BarChart3 size={12} className="text-white" />
          </div>
          <h2 className="font-extrabold text-[15px]">
            {activeTab === "active" ? "Current Portfolio" : "Resolved Cases"}
          </h2>
        </div>

        {/* Filter UI */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 font-extrabold text-[11px] px-3 py-1.5 rounded-full transition-all border",
                selectedCategory
                  ? "bg-[#8c8fff] text-white border-[#8c8fff]"
                  : "bg-white text-gray-800 border-transparent hover:bg-gray-50",
              )}
            >
              <Filter
                size={12}
                className={cn(
                  selectedCategory ? "text-white" : "text-gray-700",
                )}
              />
              {selectedCategory ? (
                <span>{selectedCategory}</span>
              ) : (
                <span>Filter</span>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-50 p-4 rounded-2xl shadow-xl border-gray-100"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-bold text-gray-800 uppercase tracking-wider px-2 py-1">
                Filter by Category
              </span>

              {FILTER_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    // Toggle: if clicking active category, clear it
                    setSelectedCategory((prev) =>
                      prev === cat.value ? null : cat.value,
                    );
                    setIsFilterOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-colors text-left",
                    selectedCategory === cat.value
                      ? "bg-[#F5F6F9] text-[#1b1c23]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-[#1b1c23]",
                  )}
                >
                  {cat.label}
                  {selectedCategory === cat.value && (
                    <Check size={14} className="text-[#8c8fff]" />
                  )}
                </button>
              ))}

              {selectedCategory && (
                <>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setIsFilterOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    <XCircle size={14} />
                    Clear Filter
                  </button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* List Content */}
      <div className="flex flex-col gap-6 min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="animate-spin text-[#8c8fff]" />
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Gavel className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold">
              {selectedCategory
                ? `No ${selectedCategory} cases found`
                : "No cases found"}
            </p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-2 text-xs font-bold text-[#8c8fff] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredDisputes.map((d) => <DisputeCard key={d.id} dispute={d} />)
        )}
      </div>

      <button
        onClick={onEarnClick}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 group"
      >
        <div
          className="
          relative flex items-center gap-3 px-6 py-3.5
          bg-[#1b1c23] rounded-full
          border border-white/10
          shadow-[0_10px_40px_-10px_rgba(27,28,35,0.4)]
          hover:shadow-[0_20px_40px_-10px_rgba(140,143,255,0.3)]
          hover:-translate-y-1 active:scale-95
          transition-all duration-300 ease-out
        "
        >
          {/* Animated Gradient Background Effect (Optional subtle shine) */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>

          {/* Icon - Switched to Brand Purple or Money Green based on preference */}
          <Sparkles className="w-4 h-4 text-[#8c8fff] fill-[#8c8fff]/20" />

          {/* Text - Single Line, Bold, Clean */}
          <span className="text-white font-manrope font-semibold tracking-wide pr-1">
            Start Earning
          </span>
        </div>
      </button>
    </div>
  );
};
