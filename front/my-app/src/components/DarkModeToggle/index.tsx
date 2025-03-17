"use client";

import React, { useState, useEffect } from "react";

export default function DarkModeToggle(): React.ReactElement {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Lee el tema guardado en localStorage o usa 'light' por defecto
    const theme = localStorage.getItem("theme") || "light";
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
    >
      {isDark ? "Modo Claro" : "Modo Oscuro"}
    </button>
  );
}
