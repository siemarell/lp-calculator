import cn from "classnames";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Button = ({ className, children, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "px-4 py-2 text-white rounded hover:opacity-90 transition-opacity",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}; 