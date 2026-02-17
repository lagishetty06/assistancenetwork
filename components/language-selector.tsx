"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Check } from "lucide-react"
import { i18nService, type Language } from "@/lib/i18n"

interface LanguageSelectorProps {
  variant?: "default" | "compact"
  showFlag?: boolean
}

export function LanguageSelector({ variant = "default", showFlag = true }: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null)
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    initializeLanguageSelector()
  }, [])

  const initializeLanguageSelector = async () => {
    try {
      // Initialize i18n service if not already done
      await i18nService.initialize()

      // Get current language and supported languages
      const current = i18nService.getCurrentLanguageInfo()
      const supported = i18nService.getSupportedLanguages()

      setCurrentLanguage(current)
      setSupportedLanguages(supported)

      // Listen for language changes
      i18nService.onLanguageChange((languageCode) => {
        const newLanguage = supported.find((lang) => lang.code === languageCode)
        if (newLanguage) {
          setCurrentLanguage(newLanguage)
        }
      })
    } catch (error) {
      console.error("❌ Failed to initialize language selector:", error)
    }
  }

  const handleLanguageChange = async (languageCode: string) => {
    setIsLoading(true)
    try {
      const result = await i18nService.changeLanguage(languageCode)
      if (result.success) {
        console.log(`✅ Language changed to: ${languageCode}`)
        // Force page reload to apply translations
        window.location.reload()
      } else {
        console.error("❌ Failed to change language:", result.error)
      }
    } catch (error) {
      console.error("❌ Language change error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getLanguageFlag = (languageCode: string): string => {
    const flags: Record<string, string> = {
      en: "🇺🇸",
      te: "🇮🇳",
      hi: "🇮🇳",
      ta: "🇮🇳",
    }
    return flags[languageCode] || "🌐"
  }

  if (!currentLanguage || supportedLanguages.length === 0) {
    return null
  }

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            {showFlag && <span className="mr-1">{getLanguageFlag(currentLanguage.code)}</span>}
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {supportedLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                {showFlag && <span className="mr-2">{getLanguageFlag(language.code)}</span>}
                <span>{language.nativeName}</span>
              </div>
              {currentLanguage.code === language.code && <Check className="h-4 w-4 text-green-600" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading} className="min-w-[140px] bg-transparent">
          {showFlag && <span className="mr-2">{getLanguageFlag(currentLanguage.code)}</span>}
          <Globe className="h-4 w-4 mr-2" />
          <span>{currentLanguage.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Select Language</p>
          <p className="text-xs text-gray-500">Choose your preferred language</p>
        </div>
        <div className="border-t my-1"></div>
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center">
              {showFlag && <span className="mr-3 text-lg">{getLanguageFlag(language.code)}</span>}
              <div>
                <div className="font-medium">{language.nativeName}</div>
                <div className="text-xs text-gray-500">{language.name}</div>
              </div>
            </div>
            {currentLanguage.code === language.code && <Check className="h-4 w-4 text-green-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
