"use client";

import React from "react";
import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 bg-[#F8F9FC] relative overflow-hidden font-manrope items-center justify-center p-6">
      {/* 1. Ambient Background Glow (Purple) */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#8c8fff]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 2. Main Card */}
      <div className="w-full max-w-sm bg-white rounded-[32px] p-8 text-center shadow-[0_20px_60px_-15px_rgba(27,28,35,0.08)] border border-white relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Icon Animation */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-[#F8F9FC] rounded-full flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-[#8c8fff]/10 rounded-full blur-xl scale-75 group-hover:scale-90 transition-transform duration-500" />
            <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50">
              <FileQuestion className="w-10 h-10 text-[#8c8fff]" />
            </div>
          </div>
        </div>

        {/* 404 Text Layering */}
        <div className="relative mb-8">
          <h1 className="text-8xl font-black text-[#1b1c23] tracking-tighter opacity-[0.03] absolute left-1/2 -translate-x-1/2 -top-8 select-none">
            404
          </h1>
          <h2 className="text-2xl font-extrabold text-[#1b1c23] mb-2 relative z-10">
            Case Not Found
          </h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[260px] mx-auto relative z-10">
            It looks like this file is missing, archived, or never existed in
            the protocol.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-4 bg-[#1b1c23] text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-200 hover:bg-[#2c2d33] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full py-4 bg-white border border-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
        Slice Protocol
      </div>
    </div>
  );
}
