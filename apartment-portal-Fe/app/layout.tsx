import type { Metadata } from "next"
import { Inter, Be_Vietnam_Pro } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { LanguageProvider } from "../components/language-context"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })
const beVietnam = Be_Vietnam_Pro({ subsets: ["vietnamese"], weight: ["300","400","500","600","700","800"] })

export const metadata: Metadata = {
  title: "Apartment Portal",
  description: "Hệ thống quản lý tòa nhà chung cư",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let initialLanguage: "vi" | "en" = "vi";
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const langCookie = cookieStore.get('language')?.value;
    if (langCookie === 'en' || langCookie === 'vi') initialLanguage = langCookie;
  } catch (error) {
    // Fallback to default language if cookies can't be read
    console.log('Could not read language cookie:', error);
  }
  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <body className={beVietnam.className} suppressHydrationWarning>
        <ClientLayout initialLanguage={initialLanguage}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ClientLayout>
      </body>
    </html>
  )
}
