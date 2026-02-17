"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Bell,
  Users,
  MapPin,
  Cloud,
  Menu,
  X,
  Shield,
  Heart,
  User,
  LogOut,
  Settings,
  UserCircle,
  ChevronDown,
  MessageSquare,
  Brain,
  Phone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { LanguageSelector } from "@/components/language-selector"
import { i18nService } from "@/lib/i18n"

// ✅ Firebase (SAFE)
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [translations, setTranslations] = useState<any>({})

  useEffect(() => {
    // Initialize i18n
    i18nService.initialize().then(updateTranslations)
    i18nService.onLanguageChange(updateTranslations)

    // ✅ Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  const updateTranslations = () => {
    setTranslations({
      home: i18nService.t("navigation.home"),
      help: i18nService.t("navigation.help"),
      volunteer: i18nService.t("navigation.volunteer"),
      resources: i18nService.t("navigation.resources"),
      weather: i18nService.t("navigation.weather"),
      about: i18nService.t("navigation.about"),
      dashboard: i18nService.t("navigation.dashboard"),
      profile: i18nService.t("navigation.profile"),
      settings: i18nService.t("navigation.settings"),
      signIn: i18nService.t("navigation.signIn"),
      signOut: i18nService.t("navigation.signOut"),
    })
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut(auth)
      setUser(null)
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out error:", error)
      alert("Failed to sign out")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <nav className="bg-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8" />
            <span className="text-xl font-bold">AAN</span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 hover:text-red-200">
              <Bell className="h-5 w-5" />
              <span>{translations.home}</span>
            </Link>

            <Link href="/help-requests" className="flex items-center space-x-2 hover:text-red-200">
              <Heart className="h-5 w-5" />
              <span>{translations.help}</span>
            </Link>

            <Link href="/volunteer" className="flex items-center space-x-2 hover:text-red-200">
              <Users className="h-5 w-5" />
              <span>{translations.volunteer}</span>
            </Link>

            <Link href="/resources" className="flex items-center space-x-2 hover:text-red-200">
              <MapPin className="h-5 w-5" />
              <span>{translations.resources}</span>
            </Link>

            <Link href="/weather" className="flex items-center space-x-2 hover:text-red-200">
              <Cloud className="h-5 w-5" />
              <span>{translations.weather}</span>
            </Link>

            {/* Advanced */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white">
                  <Brain className="h-5 w-5 mr-1" />
                  Advanced <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild><Link href="/ai-prediction">AI Prediction</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/crowdsource-alerts">Crowd Alerts</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/contact-tree">Contact Tree</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/sms-demo">SMS Demo</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/about" className="hover:text-red-200">
              {translations.about}
            </Link>

            <LanguageSelector variant="compact" />

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white">
                    <UserCircle className="h-6 w-6 mr-1" />
                    {user.displayName?.split(" ")[0] || "User"}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoading ? "Signing out..." : translations.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="bg-white text-red-600">
                  {translations.signIn}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
    </nav>
  )
}
