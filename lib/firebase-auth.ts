"use client"

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth"
import { auth } from "./firebase"
import { useState, useEffect } from "react"

// Types
export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export interface PhoneAuthResult {
  success: boolean
  confirmationResult?: ConfirmationResult
  error?: string
}

// Current user getter
export function getCurrentUser(): User | null {
  return auth.currentUser
}

// Auth state change listener
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// Email/Password Sign In
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: result.user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Email/Password Sign Up
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { success: true, user: result.user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Google Sign In (Popup)
export async function signInWithGooglePopup(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider()
    provider.addScope("email")
    provider.addScope("profile")

    const result = await signInWithPopup(auth, provider)
    return { success: true, user: result.user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Google Sign In (Redirect)
export async function signInWithGoogleRedirect(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider()
    provider.addScope("email")
    provider.addScope("profile")

    await signInWithRedirect(auth, provider)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Get redirect result
export async function getGoogleRedirectResult(): Promise<AuthResult> {
  try {
    const result = await getRedirectResult(auth)
    if (result) {
      return { success: true, user: result.user }
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Phone Authentication - Setup reCAPTCHA
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, {
    size: "normal",
    callback: () => {
      console.log("reCAPTCHA solved")
    },
    "expired-callback": () => {
      console.log("reCAPTCHA expired")
    },
  })
}

// Phone Authentication - Send OTP
export async function sendPhoneOTP(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier,
): Promise<PhoneAuthResult> {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    return { success: true, confirmationResult }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Phone Authentication - Verify OTP
export async function verifyPhoneOTP(confirmationResult: ConfirmationResult, otp: string): Promise<AuthResult> {
  try {
    const result = await confirmationResult.confirm(otp)
    return { success: true, user: result.user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Sign Out
export async function signOutUser(): Promise<AuthResult> {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// React Hook for Auth State
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return { user, loading, logout }
}
