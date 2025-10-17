"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, ThemeProviderProps as NextThemesProviderProps } from "next-themes";

type ThemeProviderProps = Omit<NextThemesProviderProps, 'children'> & {
  children: React.ReactNode;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props} storageKey="app-theme">
      {children}
    </NextThemesProvider>
  );
}
