import { Outlet } from "react-router";
import { BottomNav } from "@/components/BottomNav/BottomNav";

/** 認証済みの画面共通レイアウト。画面下部にグローバルメニューを表示する。 */
export function AppLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}
