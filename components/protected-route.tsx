"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Shield } from "lucide-react"

// ✅ Firebase (official & safe)
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 1️⃣ Quick sync check
    if (auth.currentUser) {
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    // 2️⃣ Listen to auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push(redirectTo)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router, redirectTo])

  // 🔄 Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-red-600 animate-pulse" />
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // 🔐 Not authenticated → redirected
  if (!isAuthenticated) {
    return null
  }

  // ✅ Authenticated → render page
  return <>{children}</>
}
