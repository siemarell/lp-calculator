import cn from "classnames";

interface BlockProps {
  className?: string;
  children?: React.ReactNode;
}

export const Block = (props: BlockProps) => {
  return (
    <div className={cn("rounded-xl border p-4", props.className)}>
      {props.children}
    </div>
  );
};
