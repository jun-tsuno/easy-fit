import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="テーマを切り替える"
      onClick={toggleTheme}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
