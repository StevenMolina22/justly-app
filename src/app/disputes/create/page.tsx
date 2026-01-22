"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
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

// Import Modular Components
import {
  WizardProgress,
  StepBasics,
  StepParties,
  StepEvidence,
  StepReview,
} from "@/components/create";
import type {
  StepDefinition,
} from "@/components/create";

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
    <div className="flex flex-col h-screen bg-[#F8F9FC] overflow-hidden relative">
      {/* --- HEADER --- */}
      <div className="pt-8 px-6 pb-4 bg-white shadow-sm z-20 flex justify-between items-center">
        <button
          onClick={handleBack}
          disabled={isProcessing}
          className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-[#1b1c23]" />
        </button>
        {/* Progress Dots */}
        <WizardProgress currentStep={currentStep} totalSteps={STEPS.length} />
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-4">
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
