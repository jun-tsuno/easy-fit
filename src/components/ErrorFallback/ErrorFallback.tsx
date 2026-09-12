import { Button } from "@chakra-ui/react";
import { LuHouse, LuRotateCw } from "react-icons/lu";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import styles from "./ErrorFallback.module.css";

type ErrorFallbackProps = {
  title?: string;
  description?: string;
};

/** アプリ全体で共通のエラーフォールバックUI。予期しない例外/ルーティングエラー双方から利用する。 */
function ErrorFallback({
  title = "予期しないエラーが発生しました",
  description = "しばらくしてから再度お試しください。問題が解決しない場合はアプリを再読み込みしてください。",
}: ErrorFallbackProps) {
  return (
    <PageContainer className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <Button size="lg" w="full" onClick={() => window.location.reload()}>
            <LuRotateCw />
            再読み込み
          </Button>
          <Button
            size="lg"
            w="full"
            variant="outline"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <LuHouse />
            ホームに戻る
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

export { ErrorFallback };
