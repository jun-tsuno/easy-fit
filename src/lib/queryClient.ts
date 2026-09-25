import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // デフォルト(0ms)だと取得直後から stale 扱いになり、同じクエリキーを
      // 再度観測するたび(例: カレンダーで日付をタップし直す)に毎回バックグラウンドで
      // 再フェッチが走ってしまう。キャッシュを一定時間は新鮮とみなし、余計な
      // API呼び出しを抑える
      staleTime: 60 * 1000,
    },
  },
});
