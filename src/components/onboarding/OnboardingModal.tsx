"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Coins, Eye, Lock, Scale, X } from "lucide-react";
import { useEffect, type ComponentType } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSliceAccount } from "@/hooks/core/useSliceAccount";
import {
  ONBOARDING_REPLAY_EVENT,
  useOnboarding,
} from "@/hooks/ui/useOnboarding";

type Step = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
};

const STEPS: Step[] = [
  {
    id: "welcome",
    title: "Welcome to Slice",
    description:
      "Slice is a neutral system where real people review disputes and decide the outcome fairly.",
    icon: Scale,
    iconClassName: "bg-sky-100 text-sky-700",
  },
  {
    id: "private-voting",
    title: "Vote, then Reveal",
    description:
      "Jurors first commit a hidden vote, then reveal it later. This prevents copy-voting and bias.",
    icon: Lock,
    iconClassName: "bg-amber-100 text-amber-700",
  },
  {
    id: "rewards",
    title: "Get rewarded for being right",
    description:
      "When your decision matches the final outcome, you earn rewards. Honest decisions pay off.",
    icon: Coins,
    iconClassName: "bg-emerald-100 text-emerald-700",
  },
];

export function OnboardingModal() {
  const { address, isConnected } = useSliceAccount();
  const { isOpen, step, setStep, next, open, complete, skip } = useOnboarding(
    address,
    isConnected,
  );

  useEffect(() => {
    const handleReplay = () => {
      if (!isConnected) return;
      open();
    };

    window.addEventListener(ONBOARDING_REPLAY_EVENT, handleReplay);
    return () => {
      window.removeEventListener(ONBOARDING_REPLAY_EVENT, handleReplay);
    };
  }, [isConnected, open]);

  const currentStep = STEPS[step] ?? STEPS[0];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step >= STEPS.length - 1) {
      complete();
      return;
    }

    next(STEPS.length);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          skip();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] w-full rounded-[28px] border-gray-100 bg-white p-0 shadow-2xl sm:max-w-sm"
      >
        <div className="relative overflow-hidden">
          <div className="absolute -top-24 -left-24 h-52 w-52 rounded-full bg-sky-200/35 blur-2xl" />
          <div className="absolute -right-24 -bottom-24 h-52 w-52 rounded-full bg-emerald-200/35 blur-2xl" />

          <div className="relative p-6">
            <button
              type="button"
              onClick={skip}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Skip onboarding"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex items-center justify-between pr-10">
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                Step {step + 1} of {STEPS.length}
              </span>
              <button
                type="button"
                onClick={skip}
                className="text-xs font-semibold text-gray-500 underline-offset-4 hover:text-gray-700 hover:underline"
              >
                Skip
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl ${currentStep.iconClassName}`}
                >
                  <Icon className="h-10 w-10" />
                </div>

                <div className="space-y-3 text-center">
                  <DialogTitle className="text-2xl font-extrabold tracking-tight text-[#1b1c23]">
                    {currentStep.title}
                  </DialogTitle>
                  <DialogDescription className="px-2 text-base font-medium leading-relaxed text-gray-600">
                    {currentStep.description}
                  </DialogDescription>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex justify-center gap-2">
              {STEPS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === step ? "w-6 bg-[#1b1c23]" : "w-2 bg-gray-200"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="mt-6 h-12 w-full rounded-2xl bg-[#1b1c23] text-base font-bold text-white hover:bg-[#2c2d33]"
            >
              {step === STEPS.length - 1 ? (
                <>
                  Start Judging <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
