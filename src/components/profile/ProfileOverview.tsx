"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Flame,
  Target,
  Wallet,
  Briefcase,
  ArrowRight,
  Edit2,
  X,
} from "lucide-react";
import { useJurorStats } from "@/hooks/voting/useJurorStats";
import { useWithdraw } from "@/hooks/actions/useWithdraw";
import { useUserProfile } from "@/hooks/user/useUserProfile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { PendingPaymentsDialog } from "@/components/profile/PendingPaymentsDialog";
import { PendingExecutionsDialog } from "@/components/profile/PendingExecutionsDialog";
import { SelectAvatar } from "@/components/profile/SelectAvatar";
import { SuccessAnimation } from "@/components/SuccessAnimation";

export const ProfileOverview = () => {
  const router = useRouter();
  const { stats, rank } = useJurorStats();
  const { withdraw, isWithdrawing, claimableAmount, hasFunds } = useWithdraw();

  // Hook Integration
  const { avatar, name, updateAvatar, updateName, availableAvatars } =
    useUserProfile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [pendingAvatar, setPendingAvatar] = useState(avatar);

  // Success Animation State
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize editing states when dialog opens
  React.useEffect(() => {
    if (isDialogOpen) {
      setEditingName(name);
      setPendingAvatar(avatar);
    }
  }, [isDialogOpen, name, avatar]);

  // Handle withdrawal with success animation
  // Note: Error notifications are handled by the useWithdraw hook via toast.error
  const handleWithdraw = async () => {
    if (!hasFunds || isWithdrawing) return;

    const success = await withdraw();

    if (success) {
      setShowSuccess(true);
      // Trigger re-fetch of stats after successful withdrawal
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Give time for success animation
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
  };

  return (
    <div className="flex flex-col gap-2 pb-10">
      <div className="flex flex-col gap-0">
        <PendingPaymentsDialog />
        <PendingExecutionsDialog />
      </div>

      {/* Hero Card */}
      <div className="relative w-full rounded-4xl p-1 bg-linear-to-b from-gray-100 to-white shadow-xl shadow-gray-200/50">
        <div className="bg-[#1b1c23] rounded-[30px] p-6 pb-8 text-white flex flex-col items-center gap-4 relative overflow-hidden">
          {/* Avatar Section with Modal */}
          <div className="relative z-10 mt-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="group relative outline-none transition-transform hover:scale-105 active:scale-95 cursor-pointer rounded-full">
                  <div className="w-28 h-28 rounded-full p-1 bg-linear-to-br from-[#8c8fff] to-blue-500 shadow-2xl relative">
                    <div className="w-full h-full rounded-full border-[3px] border-[#1b1c23] overflow-hidden bg-[#2c2d33]">
                      <img
                        src={avatar}
                        alt="Juror Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Rank Badge */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-linear-to-r from-[#8c8fff] to-[#7a7de0] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg border-[3px] border-[#1b1c23] z-20 whitespace-nowrap">
                      {rank}
                    </div>

                    {/* Hover Overlay for Edit Hint */}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <Edit2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </button>
              </DialogTrigger>

              <DialogContent
                className="sm:max-w-[425px] border-none bg-transparent shadow-none p-0 flex flex-col items-center justify-center gap-6"
                showCloseButton={false}
              >
                <DialogTitle className="sr-only">Edit Profile</DialogTitle>

                {/* Profile Editor UI in Dialog */}
                <div className="bg-[#1b1c23] w-full max-w-xs rounded-3xl p-5 border border-white/10 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 relative">
                  {/* Custom Close Button */}
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center gap-6">
                    {/* Name Input Section */}
                    <div className="w-full">
                      <label className="text-white/70 font-manrope font-semibold text-xs uppercase tracking-wider mb-2 block">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-black/20 text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-[#8c8fff] focus:outline-none transition-colors font-manrope"
                      />
                    </div>

                    {/* Avatar Selector Section */}
                    <div className="w-full">
                      <span className="text-white/70 font-manrope font-semibold text-xs uppercase tracking-wider mb-2 block">
                        Select Avatar
                      </span>

                      <div className="w-full bg-black/20 rounded-2xl p-2 inner-shadow">
                        <SelectAvatar
                          currentAvatar={pendingAvatar}
                          options={availableAvatars}
                          onSelect={(newUrl) => {
                            setPendingAvatar(newUrl);
                          }}
                        />
                      </div>
                    </div>

                    {/* Save Changes Button */}
                    <button
                      onClick={() => {
                        if (editingName.trim()) {
                          updateName(editingName.trim());
                        }
                        if (pendingAvatar !== avatar) {
                          updateAvatar(pendingAvatar);
                        }
                        setIsDialogOpen(false);
                      }}
                      className="w-full bg-[#8c8fff] hover:bg-[#7a7de0] text-white font-bold py-3 rounded-xl transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Rank Badge */}
                <div className="text-white font-manrope font-bold text-lg tracking-tight bg-[#1b1c23]/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                  {rank}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Name & Lifetime Earnings */}
          <div className="flex flex-col items-center gap-1 z-10 w-full">
            <h2 className="font-manrope font-black text-2xl tracking-tight">
              {name}
            </h2>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-80">
                Lifetime Earnings
              </span>
              <span className="text-lg font-black text-white tracking-tight">
                {stats.earnings} USDC
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 divide-x divide-white/10 w-full bg-white/5 border border-white/5 rounded-2xl py-4 backdrop-blur-sm mt-1">
            <StatItem
              icon={<Target className="w-4 h-4 text-emerald-400" />}
              label="Accuracy"
              value={stats.accuracy}
              bg="bg-emerald-500/10"
            />
            <StatItem
              icon={<Trophy className="w-4 h-4 text-blue-400" />}
              label="Cases"
              value={stats.matches}
              bg="bg-blue-500/10"
            />
            <StatItem
              icon={<Flame className="w-4 h-4 text-orange-400" />}
              label="Wins"
              value={stats.wins}
              bg="bg-orange-500/10"
            />
          </div>
        </div>
      </div>

      {/* Withdrawal Section */}
      {hasFunds && (
        <div className="bg-[#1b1c23] rounded-3xl p-6 text-white shadow-lg shadow-indigo-200/50 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Claimable Earnings
              </span>
              <div className="text-3xl font-black mt-1">
                {claimableAmount} USDC
              </div>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="w-full py-3.5 bg-white text-[#1b1c23] rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 relative z-10"
          >
            {isWithdrawing ? "Processing..." : "Withdraw to Wallet"}
          </button>
        </div>
      )}

      {/* Primary Action */}
      <Button
        onClick={() => router.push("/manage")}
        className="h-auto py-5 flex items-center justify-between px-6 rounded-[20px] bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#8c8fff] transition-all group"
        variant="ghost"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1b1c23] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block text-sm font-extrabold text-[#1b1c23]">
              Dispute Manager
            </span>
            <span className="text-[11px] font-medium text-gray-400">
              Create cases, submit evidence & pay
            </span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#8c8fff] group-hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </Button>

      {/* Success Animation Overlay */}
      {showSuccess && <SuccessAnimation onComplete={handleAnimationComplete} />}
    </div>
  );
};

const StatItem = ({ icon, label, value, bg }: any) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center mb-1`}
    >
      {icon}
    </div>
    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
      {label}
    </span>
    <span className="text-base font-extrabold text-white">{value}</span>
  </div>
);
