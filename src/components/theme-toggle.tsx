import { IconButton } from "@chakra-ui/react";
import { LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton
      variant="outline"
      aria-label="テーマを切り替える"
      onClick={toggleTheme}
    >
      {theme === "dark" ? <LuSun /> : <LuMoon />}
    </IconButton>
  );
}
