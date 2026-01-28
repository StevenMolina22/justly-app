import React from "react";

interface DemandDetailSectionProps {
  detail: string;
}

export const DemandDetailSection: React.FC<DemandDetailSectionProps> = ({
  detail,
}) => {
  return (
    <div className="mt-5 mx-5 flex flex-col gap-3">
      <h3 className="font-manrope font-extrabold text-base text-[#1b1c23] tracking-[-0.32px] leading-[1.2] m-0">
        Claim Details
      </h3>
      <p className="font-manrope font-normal text-[14px] text-[#31353b] tracking-[-0.28px] leading-normal m-0">
        {detail}
      </p>
    </div>
  );
};
