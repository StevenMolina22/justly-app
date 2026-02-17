import React from "react";

type Props = React.SVGProps<SVGSVGElement>;

export function IconLogo(props: Props) {
  return (
    <svg
      viewBox="0 0 34 43"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <image href="/logos/justly.svg" width="34" height="43" />
    </svg>
  );
}
