import { isRouteErrorResponse, useRouteError } from "react-router";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";

/** React Router のルーティング/データ取得起因のエラーを表示する。各ルートの errorElement に設定する。 */
export function RouteErrorBoundary() {
  const error = useRouteError();

  if (import.meta.env.DEV) {
    console.error("RouteErrorBoundary caught an error:", error);
  }

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <ErrorFallback
        title="ページが見つかりません"
        description="指定されたページは存在しないか、移動した可能性があります。"
      />
    );
  }

  return <ErrorFallback />;
}
