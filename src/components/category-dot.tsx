import styles from "./category-dot.module.css";

function CategoryDot({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      className={className ? `${styles.dot} ${className}` : styles.dot}
      style={{ backgroundColor: color }}
    />
  );
}

export { CategoryDot };
