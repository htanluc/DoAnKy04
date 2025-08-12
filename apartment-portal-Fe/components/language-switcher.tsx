"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { t, Language, useLanguage } from "../lib/i18n"

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    // Reload page to apply changes
    window.location.reload()
  }

  if (!mounted) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('vi')}
          className={language === 'vi' ? 'bg-accent' : ''}
        >
          🇻🇳 {t('language.vi', language)}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className={language === 'en' ? 'bg-accent' : ''}
        >
          🇺🇸 {t('language.en', language)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 