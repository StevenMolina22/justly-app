"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Shield,
  FileText,
  ImageIcon,
  Mic,
  PlayCircle,
  AudioLines,
  Quote,
  XIcon,
} from "lucide-react";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogImage,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogDescription,
} from "@/components/core/morphing-dialog";
import { shortenAddress } from "@/util/wallet";
import { DisputeUI } from "@/util/disputeAdapter";

interface PartyData {
  name: string;
  displayName: string;
  address: string;
  role: string;
  description: string;
  audio: string | null | undefined;
  images: string[];
  color: string;
  bg: string;
  avatar: string;
}

interface CaseFileViewProps {
  dispute: DisputeUI;
  defaultTab?: "claimant" | "defendant";
}

export function CaseFileView({
  dispute,
  defaultTab = "claimant",
}: CaseFileViewProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const parties: { claimant: PartyData; defendant: PartyData } = {
    claimant: {
      name: dispute.claimerName || dispute.claimer,
      displayName: shortenAddress(dispute.claimerName || dispute.claimer),
      address: dispute.claimer,
      role: "Claimant",
      description: dispute.description || "No statement provided.",
      audio: dispute.audioEvidence,
      images: dispute.carouselEvidence || [],
      color: "text-blue-500",
      bg: "bg-blue-500",
      avatar: "/images/profiles-mockup/profile-1.jpg",
    },
    defendant: {
      name: dispute.defenderName || dispute.defender,
      displayName: shortenAddress(dispute.defenderName || dispute.defender),
      address: dispute.defender,
      role: "Defendant",
      description:
        dispute.defenderDescription ||
        "The defendant has not submitted a counter-statement.",
      audio: dispute.defenderAudioEvidence,
      images: dispute.defenderCarouselEvidence || [],
      color: "text-gray-500",
      bg: "bg-gray-800",
      avatar: "/images/profiles-mockup/profile-2.jpg",
    },
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs
        defaultValue={defaultTab}
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "claimant" | "defendant")}
        className="flex flex-col h-full"
      >
        {/* Tabs Header */}
        <div className="px-6 pb-4 shrink-0">
          <TabsList className="w-full bg-white h-auto p-1 rounded-2xl border border-gray-200 shadow-sm flex">
            <TabsTrigger
              value="claimant"
              className="flex-1 gap-2 rounded-xl py-3 data-[state=active]:bg-[#1b1c23] data-[state=active]:text-white transition-all font-bold text-xs text-gray-500"
            >
              <User className="w-4 h-4" />
              Claimant
            </TabsTrigger>
            <TabsTrigger
              value="defendant"
              className="flex-1 gap-2 rounded-xl py-3 data-[state=active]:bg-[#1b1c23] data-[state=active]:text-white transition-all font-bold text-xs text-gray-500"
            >
              <Shield className="w-4 h-4" />
              Defendant
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
          <TabsContent
            value="claimant"
            className="mt-0 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-left-2 data-[state=active]:duration-300"
          >
            <PartyContent data={parties.claimant} type="claimant" />
          </TabsContent>
          <TabsContent
            value="defendant"
            className="mt-0 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-2 data-[state=active]:duration-300"
          >
            <PartyContent data={parties.defendant} type="defendant" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// --- Sub-component for clean content rendering ---
function PartyContent({ data, type }: { data: PartyData; type: string }) {
  const isClaimant = type === "claimant";

  return (
    <div className="space-y-6">
      {/* 1. Profile Header */}
      <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative">
          <img
            src={data.avatar}
            alt="Avatar"
            className="w-14 h-14 rounded-full object-cover border border-gray-100"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white ${data.bg}`}
          >
            {isClaimant ? "C" : "D"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${data.color}`}
          >
            {data.role}
          </div>
          <h2 className="text-lg font-extrabold text-[#1b1c23] truncate">
            {data.displayName}
          </h2>
          <div className="text-xs text-gray-400 font-mono truncate">
            {data.address}
          </div>
        </div>
      </div>

      {/* 2. Statement */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 ml-1">
          <FileText className="w-4 h-4 text-[#8c8fff]" /> Statement
        </h3>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm relative">
          <Quote className="absolute top-4 left-4 w-8 h-8 text-gray-100 fill-gray-50" />
          <p className="text-base text-gray-600 leading-relaxed font-medium relative z-10 pt-2">
            {data.description}
          </p>
        </div>
      </div>

      {/* 3. Evidence Section */}
      {(data.audio || data.images.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 ml-1">
            <ImageIcon className="w-4 h-4 text-[#8c8fff]" /> Exhibits
          </h3>

          <div className="flex flex-col gap-4">
            {/* Audio Player */}
            {data.audio && (
              <MorphingDialog
                transition={{
                  type: "spring",
                  bounce: 0.05,
                  duration: 0.25,
                }}
              >
                <MorphingDialogTrigger className="w-full">
                  <div className="bg-[#1b1c23] rounded-[20px] p-4 flex items-center gap-4 shadow-lg shadow-gray-200 text-white relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]">
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-md border border-white/10">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 z-10 text-left">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        Audio Recording
                      </p>
                      <p className="text-base font-semibold">
                        {data.role}&apos;s Statement
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white text-[#1b1c23] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                      <PlayCircle className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                </MorphingDialogTrigger>

                <MorphingDialogContainer>
                  <MorphingDialogContent className="relative w-full max-w-sm bg-[#1b1c23] rounded-3xl overflow-hidden shadow-2xl border border-white/10 p-8 flex flex-col items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 relative">
                      <div className="absolute inset-0 rounded-full bg-[#8c8fff]/20 animate-pulse" />
                      <AudioLines className="w-10 h-10 text-[#8c8fff]" />
                    </div>

                    <div className="text-center">
                      <MorphingDialogTitle className="text-xl font-extrabold text-white mb-1">
                        {data.role}&apos;s Statement
                      </MorphingDialogTitle>
                      <MorphingDialogDescription className="text-sm font-medium text-gray-400">
                        Recorded Audio Evidence
                      </MorphingDialogDescription>
                    </div>

                    <audio
                      controls
                      src={data.audio}
                      className="w-full h-10 accent-[#8c8fff]"
                      style={{ filter: "invert(1) hue-rotate(180deg)" }}
                    />

                    <MorphingDialogClose
                      className="absolute top-4 right-4 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                      variants={{
                        initial: { opacity: 0, scale: 0.8 },
                        animate: { opacity: 1, scale: 1 },
                        exit: { opacity: 0, scale: 0.8 },
                      }}
                    >
                      <XIcon size={20} />
                    </MorphingDialogClose>
                  </MorphingDialogContent>
                </MorphingDialogContainer>
              </MorphingDialog>
            )}

            {/* Image Gallery */}
            {data.images.map((img: string, i: number) => (
              <MorphingDialog
                key={i}
                transition={{
                  type: "spring",
                  bounce: 0.05,
                  duration: 0.25,
                }}
              >
                <MorphingDialogTrigger className="relative aspect-[3/2] w-full bg-gray-100 rounded-[24px] overflow-hidden border border-white shadow-sm group hover:shadow-md transition-all active:scale-95 cursor-zoom-in">
                  <MorphingDialogImage
                    src={img}
                    alt={`Evidence ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3 h-3" />
                      Exhibit {i + 1}
                    </span>
                  </div>
                </MorphingDialogTrigger>

                <MorphingDialogContainer>
                  <MorphingDialogContent className="relative rounded-2xl bg-black/90 p-0 shadow-2xl max-w-[90vw] max-h-[85vh] overflow-hidden border border-white/10">
                    <MorphingDialogImage
                      src={img}
                      alt={`Evidence ${i + 1}`}
                      className="w-full h-full max-h-[80vh] object-contain"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm font-medium">
                        Exhibit {i + 1} - {data.role}&apos;s Evidence
                      </p>
                    </div>
                    <MorphingDialogClose
                      className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70 transition-colors"
                      variants={{
                        initial: { opacity: 0, scale: 0.8 },
                        animate: { opacity: 1, scale: 1 },
                        exit: { opacity: 0, scale: 0.8 },
                      }}
                    >
                      <XIcon size={20} />
                    </MorphingDialogClose>
                  </MorphingDialogContent>
                </MorphingDialogContainer>
              </MorphingDialog>
            ))}
          </div>
        </div>
      )}

      {/* Empty State for no evidence */}
      {!data.audio && data.images.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
          <Shield className="w-12 h-12 mb-2" />
          <p className="text-xs font-bold uppercase tracking-widest">
            No Evidence Submitted
          </p>
        </div>
      )}
    </div>
  );
}
