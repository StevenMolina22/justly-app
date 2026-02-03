"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Loader2,
  UploadCloud,
  User,
  Gavel,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

import { useCreateDisputeForm } from "@/hooks/forms/useCreateDisputeForm";
import { Button } from "@/components/ui/button";
import { useHeader } from "@/lib/hooks/useHeader";

// Direct imports instead of barrel file (better tree-shaking)
import { WizardProgress } from "@/components/create/WizardProgress";
import { StepBasics } from "@/components/create/StepBasics";
import { StepParties } from "@/components/create/StepParties";
import { StepEvidence } from "@/components/create/StepEvidence";
import { StepReview } from "@/components/create/StepReview";
import type { StepDefinition } from "@/components/create/index";

// --- STEPS DEFINITION ---
const STEPS: StepDefinition[] = [
  { id: 1, title: "Protocol Settings", icon: <Gavel className="w-4 h-4" /> },
  { id: 2, title: "The Parties", icon: <User className="w-4 h-4" /> },
  { id: 3, title: "Evidence", icon: <UploadCloud className="w-4 h-4" /> },
  { id: 4, title: "Review", icon: <ShieldAlert className="w-4 h-4" /> },
];

export default function CreateDisputePage() {
  const router = useRouter();

  // --- CUSTOM HOOK ---
  const {
    formData,
    updateField,
    files,
    setFiles,
    submit,
    isProcessing
  } = useCreateDisputeForm();

  // --- WIZARD STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [showDefenderOptions, setShowDefenderOptions] = useState(false);

  // --- HANDLERS ---
  const handleNext = () => {
    // Basic Validation per step
    if (currentStep === 1 && !formData.title)
      return toast.error("Title is required");
    if (currentStep === 2 && !formData.defenderAddress)
      return toast.error("Defender address is required");
    if (currentStep === 3 && !formData.description)
      return toast.error("Description is required");

    if (currentStep < 4) setCurrentStep((c) => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((c) => c - 1);
    else router.back();
  };

  // Configure header with progress indicator
  useHeader({
    title: "Create Dispute",
    children: <WizardProgress currentStep={currentStep} totalSteps={STEPS.length} />,
  });

  // --- RENDER CURRENT STEP ---
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasics data={formData} updateField={updateField} />;
      case 2:
        return <StepParties data={formData} updateField={updateField} />;
      case 3:
        return (
          <StepEvidence
            data={formData}
            updateField={updateField}
            files={files}
            setFiles={setFiles}
          />
        );
      case 4:
        return (
          <StepReview
            data={formData}
            updateField={updateField}
            files={files}
            setFiles={setFiles}
            showDefenderOptions={showDefenderOptions}
            setShowDefenderOptions={setShowDefenderOptions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl font-extrabold text-[#1b1c23] tracking-tight">
            {STEPS[currentStep - 1].title}
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        {renderStep()}
      </div>

      {/* --- FLOATING FOOTER --- */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-30">
        <Button
          onClick={currentStep === 4 ? submit : handleNext}
          disabled={isProcessing}
          className={`
            w-full py-6 rounded-2xl font-manrope font-bold text-base shadow-xl
            flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]
            ${isProcessing ? "bg-gray-200 text-gray-400" : "bg-[#1b1c23] text-white"}
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : currentStep === 4 ? (
            <>
              Create Dispute <CheckCircle2 className="w-5 h-5" />
            </>
          ) : (
            <>
              Continue <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
