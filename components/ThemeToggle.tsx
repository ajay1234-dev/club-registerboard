"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="fixed bottom-6 right-6 p-3 rounded-full bg-gray-800 text-gray-300 shadow-lg opacity-0 transition-opacity z-50"
        aria-hidden="true"
      >
        <Moon className="w-6 h-6" />
      </button>
    );
  }

  const isLight = theme === "light";

  return (
    <button
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg shadow-black/30 transition-all z-50 
        ${isLight 
          ? "bg-white hover:bg-gray-100 text-gray-900 ring-1 ring-gray-200" 
          : "bg-gray-800 hover:bg-gray-700 text-gray-100 ring-1 ring-gray-700"
        }`}
      aria-label="Toggle theme"
    >
      {isLight ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
    </button>
  );
}
