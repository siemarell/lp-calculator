import React from "react";
import cn from "classnames";

interface H2Props {
  className?: string;
  children?: React.ReactNode;
}

export const H4 = (props: H2Props) => {
  return <h4 className={cn("text-lg", props.className)}>{props.children}</h4>;
};
