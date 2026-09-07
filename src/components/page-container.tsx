import type * as React from "react";
import styles from "./page-container.module.css";

/**
 * 全ページ共通のレイアウトコンテナ。
 * 中央寄せ・最大幅・画面高さの確保に加え、左右/上下の余白を一元管理する。
 */
function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={
        className ? `${styles.container} ${className}` : styles.container
      }
      {...props}
    />
  );
}

export { PageContainer };
