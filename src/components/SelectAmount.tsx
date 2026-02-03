import React from "react";
import { Slider } from "@/components/ui/slider";

interface AmountSelectorProps {
  selectedAmount: number;
  onAmountChange: (amount: number) => void;
}

const AMOUNTS = [1, 5, 10, 20];

const SLIDER_STYLES =
  "[&_[data-slot=slider-track]]:h-[5px] [&_[data-slot=slider-track]]:bg-[#e7eefb] [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-[#8c8fff] [&_[data-slot=slider-range]]:to-[#7eb5fd] [&_[data-slot=slider-thumb]]:h-[14px] [&_[data-slot=slider-thumb]]:w-[14px] [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-[#8c8fff] [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-none [&_[data-slot=slider-thumb]]:focus-visible:ring-0 cursor-pointer";

export const SelectAmount: React.FC<AmountSelectorProps> = ({
  selectedAmount,
  onAmountChange,
}) => {
  const getSliderPosition = () => {
    const index = AMOUNTS.indexOf(selectedAmount);
    if (index === -1) return 0;
    return (index / (AMOUNTS.length - 1)) * 100;
  };

  const handleAmountClick = (amount: number) => {
    onAmountChange(amount);
  };

  const position = getSliderPosition();

  return (
    <div className="w-full px-7 mt-[50px] mb-5 relative flex flex-col items-center min-h-[80px]">
      {/* Selected Label Bubble */}
      <div
        className="bg-[#8c8fff] rounded-lg px-3 h-6 flex items-center justify-center font-manrope font-extrabold text-xs text-white tracking-[-0.36px] leading-none mb-2 absolute -top-[35px] whitespace-nowrap min-w-[58px] transition-[left] duration-200 ease-linear z-10"
        style={{
          left: `${position}%`,
          transform: "translateX(-50%)",
        }}
      >
        <span>{selectedAmount} USDC</span>
      </div>

      {/* Slider Container */}
      <div className="w-full max-w-[301px] relative mb-5">
        <Slider
          value={[AMOUNTS.indexOf(selectedAmount)]}
          min={0}
          max={AMOUNTS.length - 1}
          step={1}
          onValueChange={(vals) => {
            const index = vals[0];
            if (index !== undefined && index >= 0 && index < AMOUNTS.length) {
              onAmountChange(AMOUNTS[index]);
            }
          }}
          className={SLIDER_STYLES}
        />
      </div>

      {/* Amount Labels */}
      <div className="w-full max-w-[301px] relative h-4 mt-2">
        {AMOUNTS.map((amount) => (
          <button
            key={amount}
            className={`absolute top-0 bg-transparent border-none font-manrope text-sm text-[#31353b] tracking-[-0.36px] leading-[1.25] cursor-pointer p-0 transition-opacity duration-200 whitespace-nowrap ${amount === selectedAmount
              ? "opacity-100 font-extrabold"
              : "opacity-80 font-semibold hover:opacity-100"
              }`}
            onClick={() => handleAmountClick(amount)}
            style={{
              left: `${(AMOUNTS.indexOf(amount) / (AMOUNTS.length - 1)) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            ${amount}
          </button>
        ))}
      </div>
    </div>
  );
};
