import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

function App() {
  const { signOut } = useAuth();

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col">
      <header className="flex items-center justify-between p-4">
        <h1 className="bg-gradient-to-r from-(--accent-gradient-from) to-(--accent-gradient-to) bg-clip-text text-2xl font-semibold text-transparent">
          easy-fit
        </h1>
        <div className="flex items-center gap-2">
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
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <Button>Get Started</Button>
      </main>
    </div>
  );
}

export default App;
