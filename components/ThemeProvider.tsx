'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
// Als je TypeScript errors krijgt bij de import hierboven, 
// kun je 'any' gebruiken voor de props of de juiste types importeren.

export function ThemeProvider({ children, ...props }: any) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
