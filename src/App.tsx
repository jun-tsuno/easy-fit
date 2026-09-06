import { Dumbbell, LogOut } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/components/auth-provider";
import { PageContainer } from "@/components/page-container";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

function App() {
  const { signOut } = useAuth();

  return (
    <PageContainer>
      <header className="flex items-center justify-between pb-4">
        <h1 className="bg-gradient-to-r from-(--accent-gradient-from) to-(--accent-gradient-to) bg-clip-text text-2xl font-semibold text-transparent">
          easy-fit
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="種目管理" asChild>
            <Link to="/exercises">
              <Dumbbell />
            </Link>
          </Button>
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            aria-label="ログアウト"
            onClick={() => signOut()}
          >
            <LogOut />
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <Button>Get Started</Button>
      </main>
    </PageContainer>
  );
}

export default App;
