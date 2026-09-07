import { Button, IconButton } from "@chakra-ui/react";
import { LuDumbbell, LuLogOut, LuNotebookPen, LuWeight } from "react-icons/lu";
import { Link } from "react-router";
import styles from "@/App.module.css";
import { useAuth } from "@/components/auth-provider";
import { PageContainer } from "@/components/page-container";
import { ThemeToggle } from "@/components/theme-toggle";
import gradientStyles from "@/styles/gradient-title.module.css";

function App() {
  const { signOut } = useAuth();

  return (
    <PageContainer>
      <header className={styles.header}>
        <h1 className={gradientStyles.title}>easy-fit</h1>
        <div className={styles.headerActions}>
          <IconButton variant="outline" aria-label="種目管理" asChild>
            <Link to="/exercises">
              <LuDumbbell />
            </Link>
          </IconButton>
          <ThemeToggle />
          <IconButton
            variant="outline"
            aria-label="ログアウト"
            onClick={() => signOut()}
          >
            <LuLogOut />
          </IconButton>
        </div>
      </header>
      <main className={styles.main}>
        <Button size="lg" w="full" asChild>
          <Link to="/record">
            <LuNotebookPen />
            トレーニングを記録
          </Link>
        </Button>
        <Button size="lg" variant="outline" w="full" asChild>
          <Link to="/body-weight">
            <LuWeight />
            体重を記録
          </Link>
        </Button>
      </main>
    </PageContainer>
  );
}

export default App;
