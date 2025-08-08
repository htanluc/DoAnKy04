"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "../components/language-context";
import React from "react";

export default function ClientLayout({ children, initialLanguage }: { children: React.ReactNode, initialLanguage: "vi" | "en" }) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
} 