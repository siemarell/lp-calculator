import React from "react";
import cn from "classnames";

interface H2Props {
  className?: string;
  children?: React.ReactNode;
}

export const H2 = (props: H2Props) => {
  return <h2 className={cn("text-2xl", props.className)}>{props.children}</h2>;
};
