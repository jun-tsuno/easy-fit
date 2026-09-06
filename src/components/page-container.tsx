import { cn } from "cn";
import type * as React from "react";

/**
 * 全ページ共通のレイアウトコンテナ。
 * 中央寄せ・最大幅・画面高さの確保に加え、左右/上下の余白を一元管理する。
 */
function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        "mx-auto flex min-h-svh w-full max-w-md flex-col px-6 pt-8 pb-30",
        className,
      )}
      {...props}
    />
  );
}

export { PageContainer };
