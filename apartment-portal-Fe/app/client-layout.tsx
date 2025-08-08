"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "../components/language-context";
import WebSocketToggle from "@/components/websocket-toggle";
import React, { useState } from "react";

export default function ClientLayout({ children, initialLanguage }: { children: React.ReactNode, initialLanguage: "vi" | "en" }) {
  const [websocketEnabled, setWebsocketEnabled] = useState(false);

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          {children}
          <WebSocketToggle 
            isEnabled={websocketEnabled}
            onToggle={setWebsocketEnabled}
          />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
} 