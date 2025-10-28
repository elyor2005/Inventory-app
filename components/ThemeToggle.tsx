// "use client";

// import { useTheme } from "next-themes";
// import { useEffect, useState } from "react";

// export default function ThemeToggle() {
//   const [mounted, setMounted] = useState(false);
//   const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return <div className="w-14 h-7 bg-gray-200 rounded-full animate-pulse" />;
//   }

//   const currentTheme = theme === "system" ? systemTheme : theme;
//   const isDark = currentTheme === "dark";

//   const toggleTheme = () => {
//     const newTheme = isDark ? "light" : "dark";
//     console.log("Toggling theme from", theme, "to", newTheme);
//     setTheme(newTheme);
//     console.log("Theme after set:", newTheme);
//   };

//   console.log("Current theme:", theme, "Resolved:", resolvedTheme, "System:", systemTheme, "isDark:", isDark);

//   return (
//     <div className="flex flex-col items-center gap-2">
//       <button onClick={toggleTheme} className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}>
//         <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${isDark ? "translate-x-7 left-0.5" : "translate-x-0 left-0.5"}`}>
//           {isDark ? (
//             <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
//               <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
//             </svg>
//           ) : (
//             <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
//             </svg>
//           )}
//         </div>
//       </button>

//       <span className="text-xs text-gray-500 dark:text-gray-400">
//         {theme} / {currentTheme}
//       </span>
//     </div>
//   );
// }
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="w-14 h-7 bg-gray-200 rounded-full animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button onClick={() => setTheme(isDark ? "light" : "dark")} className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300" aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"} type="button">
      <span className="sr-only">{isDark ? "Switch to light" : "Switch to dark"}</span>
      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${isDark ? "left-7" : "left-0.5"}`}>{isDark ? "🌙" : "☀️"}</div>
    </button>
  );
}
