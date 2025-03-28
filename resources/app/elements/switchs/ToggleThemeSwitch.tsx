import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToggleThemeSwitchProps {
  variant?: 'default' | 'icon-only';
  className?: string;
}

export function ToggleThemeSwitch({ variant = 'default', className }: ToggleThemeSwitchProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Get initial theme preference from localStorage
    const darkModePreference = localStorage.getItem('dark-mode') === 'true';
    setIsDarkMode(darkModePreference);
    
    // Apply theme based on preference
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('dark-mode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Icon-only variant renders just a button with the current theme icon
  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn("h-8 w-8", className)}
        aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
      >
        {isDarkMode ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>
    );
  }
  
  // Default variant with switch and icon
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <Switch
        checked={isDarkMode}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-zinc-600"
        aria-label="Toggle theme"
      />
      <span className="text-zinc-600 dark:text-zinc-400">
        {isDarkMode ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </span>
    </div>
  );
}

export default ToggleThemeSwitch;