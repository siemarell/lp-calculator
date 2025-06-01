import cn from "classnames";
import React from "react";

interface PageRootProps {
  className?: string;
  children?: React.ReactNode;
}

export const PageRoot = (props: PageRootProps) => {
  return (
    <div className={cn("mx-auto flex flex-col px-8 py-8", props.className)}>
      {props.children}
    </div>
  );
};
