import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './theme-provider';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark';

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export default ThemeToggle;
