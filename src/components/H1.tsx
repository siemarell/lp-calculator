import React from "react";
import cn from "classnames";

interface H2Props {
  className?: string;
  children?: React.ReactNode;
}

export const H1 = (props: H2Props) => {
  return <h1 className={cn("text-3xl", props.className)}>{props.children}</h1>;
};
