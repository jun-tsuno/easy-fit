import { cn } from "cn";

function CategoryDot({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block size-2.5 shrink-0 rounded-full align-middle",
        className,
      )}
      style={{ backgroundColor: color }}
    />
  );
}

export { CategoryDot };
