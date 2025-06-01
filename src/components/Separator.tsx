import { twMerge } from "tailwind-merge";
import React from "react";

export const Separator = ({
  className,
  axis = "x",
}: {
  className?: string;
  axis?: "x" | "y";
}) => (
  <div
    className={twMerge(
      "box-border bg-gray-500",
      { x: "h-[1px]", y: "w-[1px]" }[axis],
      className,
    )}
  ></div>
);
