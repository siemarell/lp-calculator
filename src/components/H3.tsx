import React from "react";
import cn from "classnames";

interface H2Props {
  className?: string;
  children?: React.ReactNode;
}

export const H3 = (props: H2Props) => {
  return <h3 className={cn("text-xl", props.className)}>{props.children}</h3>;
};
