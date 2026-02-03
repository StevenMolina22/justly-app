import React, { useRef, useState, useEffect } from "react";
import { useDrag } from "@use-gesture/react";
import { Loader2, ArrowRight } from "lucide-react";

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

interface SwipeButtonProps {
  onSwipeComplete: () => void;
  children?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SwipeButton: React.FC<SwipeButtonProps> = ({
  onSwipeComplete,
  children,
  isLoading = false,
  disabled = false,
  className = "",
}) => {
  const [x, setX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragLimit, setDragLimit] = useState(0);

  const HANDLE_WIDTH = 44;
  const PADDING = 6;

  useEffect(() => {
    if (containerRef.current) {
      setDragLimit(
        containerRef.current.clientWidth - HANDLE_WIDTH - PADDING * 2,
      );
    }
  }, []);

  const bind = useDrag(
    ({ down, movement: [mx], cancel }) => {
      if (isLoading || disabled || dragLimit === 0) return;
      const newX = clamp(mx, 0, dragLimit);
      setX(down ? newX : 0);
      if (newX > dragLimit * 0.9) {
        onSwipeComplete();
        cancel();
        setX(0);
      }
    },
    { axis: "x", filterTaps: true, rubberband: false },
  );

  const textContent = isLoading ? (
    <div className="flex items-center gap-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-base">Processing...</span>
    </div>
  ) : (
    children || "Swipe to confirm"
  );

  return (
    <div
      ref={containerRef}
      className={`relative h-14 w-75 mx-auto border-2 border-[#8c8fff] rounded-full shadow-[0px_4px_12px_rgba(140,143,255,0.2)] overflow-hidden select-none touch-none ${disabled ? "opacity-60 cursor-not-allowed grayscale" : "cursor-pointer"} ${className}`}
    >
      {/* Purple text base layer */}
      <div className="absolute inset-0 flex items-center justify-center ">
        <span className="font-manrope font-bold text-lg text-[#8c8fff] tracking-tight whitespace-nowrap leading-none translate-y-1.5">
          {textContent}
        </span>
      </div>

      {/* Gradient reveal layer with white text */}
      <div
        className="absolute left-0 top-0 h-full rounded-full overflow-hidden pointer-events-none"
        style={{ width: `${x + HANDLE_WIDTH + PADDING * 2}px` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#8c8fff] to-[#7eb5fd]" />
        <div className="absolute inset-0 w-75 flex items-center justify-center">
          <span className="font-manrope font-bold text-lg text-white tracking-tight whitespace-nowrap leading-none translate-y-1.5">
            {textContent}
          </span>
        </div>
      </div>

      {/* Draggable handle */}
      {!isLoading && !disabled && (
        <div
          {...bind()}
          className="absolute top-1.5 left-1.5 w-11 h-11 bg-gradient-to-b from-[#8c8fff] to-[#7eb5fd] rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing active:scale-95 touch-none"
          style={{ transform: `translateX(${x}px)` }}
        >
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};
