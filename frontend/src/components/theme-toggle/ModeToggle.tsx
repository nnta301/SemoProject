import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import Button from "../ui/Button";
import { cn } from "@/utils";

interface ModeToggleProps {
  className?: string;
}

export default function ModeToggle({ className }: ModeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="secondary"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "fixed top-4 left-4 z-500 cursor-pointer",
        "h-10 w-10 p-0! rounded-full",
        "border border-border-strong bg-surface backdrop-blur-md shadow-soft",
        "theme-transition transition-all duration-300 active:scale-95",
        "hover:border-brand hover:bg-brand-soft dark:hover:border-border-glow",
        className,
      )}
    >
      <div className="relative w-full h-full grid place-items-center">
        <Sun 
          size={18} 
          strokeWidth={2}
          className="absolute text-brand dark:text-accent transition-all duration-500 ease-out 
            rotate-0 scale-100 dark:-rotate-90 dark:scale-0" 
        />
        
        <Moon 
          size={18} 
          strokeWidth={2}
          className="absolute text-brand dark:text-accent transition-all duration-500 ease-out 
            rotate-90 scale-0 dark:rotate-0 dark:scale-100" 
        />
      </div>
    </Button>
  );
}