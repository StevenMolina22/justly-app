"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { PaginationDots } from "@/components/dispute-overview/PaginationDots";
import { useEvidence, EvidenceRole } from "@/hooks/evidence/useEvidence";
import { usePageSwipe } from "@/hooks/ui/usePageSwipe";
import {
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  PlayCircle,
  Mic,
  Shield,
  ArrowRight,
  ArrowLeft,
  Quote,
  XIcon,
  AudioLines,
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

interface EvidenceViewProps {
  disputeId: string;
  role: EvidenceRole;
  nextPath: string;
  prevPath: string;
  pageIndex: number;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  disputeId,
  role,
  nextPath,
  prevPath,
  pageIndex,
}) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Get Data
  const { partyInfo, statement, imageEvidence, videoEvidence, audioEvidence } =
    useEvidence(disputeId, role);

  // 2. Swipe Handlers
  const bindSwipe = usePageSwipe({
    onSwipeLeft: () => router.push(nextPath),
    onSwipeRight: () => router.push(prevPath),
  });

  const handleBack = () => router.back();

  // Determine colors based on role
  const isClaimant = role === "claimant";
  const themeColor = isClaimant ? "blue" : "gray";
  const bgGradient = isClaimant
    ? "from-blue-50/50 to-transparent"
    : "from-gray-100/50 to-transparent";

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen bg-[#F8F9FC] font-manrope relative overflow-hidden touch-none"
      {...bindSwipe()}
    >
      {/* --- 1. FIXED HEADER --- */}
      <div className="flex-none px-6 pt-4 pb-2 z-20 bg-[#F8F9FC]/80 backdrop-blur-sm">
        <DisputeOverviewHeader onBack={handleBack} />
      </div>

      {/* --- 2. SCROLLABLE CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 pt-2 flex flex-col gap-6 z-10 scrollbar-hide">
        {/* Identity Card */}
        <div className="relative bg-white rounded-[24px] p-1 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div
            className={`absolute top-0 left-0 w-full h-full rounded-[24px] bg-gradient-to-b ${bgGradient} opacity-20 pointer-events-none`}
          />

          <div className="relative bg-white rounded-[22px] p-5 border border-gray-100 overflow-hidden">
            {/* Role Strip */}
            <div
              className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-${themeColor}-500`}
            />

            <div className="flex items-center gap-4 pl-3">
              {/* Avatar with Ring */}
              <div className="relative shrink-0">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border-[3px] border-white shadow-md`}
                >
                  {partyInfo.avatar ? (
                    <img
                      src={partyInfo.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                {/* Role Icon Badge */}
                <div
                  className={`absolute -bottom-2 -right-2 p-1.5 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center text-white ${
                    isClaimant ? "bg-blue-500" : "bg-gray-800"
                  }`}
                >
                  {isClaimant ? (
                    <User size={12} fill="currentColor" />
                  ) : (
                    <Shield size={12} fill="currentColor" />
                  )}
                </div>
              </div>

              {/* Text Info */}
              <div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest text-${themeColor}-500 mb-0.5 block`}
                >
                  {partyInfo.role}
                </span>
                <h2 className="text-xl font-extrabold text-[#1b1c23] leading-tight">
                  {partyInfo.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 w-fit px-2 py-1 rounded-lg">
                  <Calendar className="w-3 h-3" />
                  <span>Submitted Dec 14</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statement Section */}
        <div>
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 ml-2 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#8c8fff]" /> Official
            Statement
          </h3>
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 relative">
            <Quote className="absolute top-4 left-4 w-8 h-8 text-gray-100 fill-gray-50" />
            <p className="text-[15px] text-gray-600 leading-relaxed font-medium relative z-10 pt-2">
              {statement}
            </p>
          </div>
        </div>

        {/* Evidence Vault */}
        {(imageEvidence.length > 0 ||
          videoEvidence.length > 0 ||
          audioEvidence) && (
          <div>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 ml-2 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-[#8c8fff]" /> Exhibits
            </h3>

            {/* Changed from Grid to Flex Column for full width */}
            <div className="flex flex-col gap-4">
              {/* 1. AUDIO EVIDENCE */}
              {audioEvidence && (
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
                          {audioEvidence.duration}
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
                          {audioEvidence.title}
                        </MorphingDialogTitle>
                        <MorphingDialogDescription className="text-sm font-medium text-gray-400">
                          Recorded Statement
                        </MorphingDialogDescription>
                      </div>

                      <audio
                        controls
                        src={audioEvidence.url!}
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

              {/* 2. IMAGE EVIDENCE (Full Width) */}
              {imageEvidence.map((img) => (
                <MorphingDialog
                  key={img.id}
                  transition={{
                    type: "spring",
                    bounce: 0.05,
                    duration: 0.25,
                  }}
                >
                  <MorphingDialogTrigger className="relative aspect-[3/2] w-full bg-gray-100 rounded-[24px] overflow-hidden border border-white shadow-sm group hover:shadow-md transition-all active:scale-95 cursor-zoom-in">
                    <MorphingDialogImage
                      src={img.url}
                      alt={img.description}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3" />
                        Image Evidence
                      </span>
                    </div>
                  </MorphingDialogTrigger>

                  <MorphingDialogContainer>
                    <MorphingDialogContent className="relative rounded-2xl bg-black/90 p-0 shadow-2xl max-w-[90vw] max-h-[85vh] overflow-hidden border border-white/10">
                      <MorphingDialogImage
                        src={img.url}
                        alt={img.description}
                        className="w-full h-full max-h-[80vh] object-contain"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-sm font-medium">
                          {img.description}
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

              {/* 3. VIDEO EVIDENCE (Full Width) */}
              {videoEvidence.map((vid) => (
                <MorphingDialog
                  key={vid.id}
                  transition={{
                    type: "spring",
                    bounce: 0.05,
                    duration: 0.25,
                  }}
                >
                  <MorphingDialogTrigger className="relative aspect-video w-full bg-gray-900 rounded-[24px] overflow-hidden border border-white shadow-sm group hover:shadow-md transition-all active:scale-95 cursor-zoom-in">
                    <img
                      src={vid.thumbnail || vid.url}
                      alt="Video"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform shadow-lg">
                        <PlayCircle className="w-7 h-7 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-red-500/90 px-3 py-1.5 rounded-xl border border-white/10 shadow-sm">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <PlayCircle className="w-3 h-3 fill-current" /> Video
                        Evidence
                      </span>
                    </div>
                  </MorphingDialogTrigger>

                  <MorphingDialogContainer>
                    <MorphingDialogContent className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                      <div className="aspect-video w-full">
                        <video
                          src={vid.url}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <MorphingDialogClose
                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70 transition-colors z-50"
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

        {/* Empty State */}
        {imageEvidence.length === 0 &&
          videoEvidence.length === 0 &&
          !audioEvidence && (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
              <Shield className="w-12 h-12 mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">
                No Evidence Submitted
              </p>
            </div>
          )}
      </div>

      {/* --- 3. NAVIGATION DOCK --- */}
      <div className="flex-none p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
        <div className="relative bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 p-2 flex items-center justify-between min-h-[72px]">
          {/* 1. ABSOLUTE CENTERED DOTS */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <PaginationDots currentIndex={pageIndex} total={4} />
          </div>

          {/* 2. BACK BUTTON (Left) */}
          <button
            onClick={() => router.push(prevPath)}
            className="relative z-10 flex items-center gap-3 px-2 py-2 pr-4 rounded-[18px] hover:bg-gray-50 active:bg-gray-100 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-[#1b1c23]" />
            </div>
            <span className="text-xs font-bold text-gray-600 group-hover:text-[#1b1c23] hidden sm:block">
              Back
            </span>
          </button>

          {/* 3. NEXT BUTTON (Right) */}
          <button
            onClick={() => router.push(nextPath)}
            className="relative z-10 flex items-center gap-3 px-2 py-2 pl-4 rounded-[18px] hover:bg-gray-50 active:bg-gray-100 transition-all group"
          >
            <span className="text-xs font-bold text-gray-600 group-hover:text-[#1b1c23] hidden sm:block">
              Next
            </span>
            <div className="w-10 h-10 rounded-full bg-[#1b1c23] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform group-active:scale-95">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
