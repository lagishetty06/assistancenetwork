"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Mail,
  Loader2,
  CheckCircle,
  AlertTriangle,
  User,
  Lock,
  Phone,
} from "lucide-react"

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function LoginPage() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("google")

  // Phone UI state (UI only for now)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        setSuccess(
          `Welcome ${
            currentUser.displayName ||
            currentUser.email ||
            currentUser.phoneNumber
          }`
        )
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
    })

    return () => unsubscribe()
  }, [router])

  // Google Login
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      setUser(result.user)
      setSuccess(
        `Signed in as ${result.user.displayName || result.user.email}`
      )
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Google sign-in failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueAsGuest = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign In to AAN
          </h1>
          <p className="text-gray-600">
            Access your Alert and Assistance Network account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {user ? "Welcome Back!" : "Choose Sign-In Method"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Error */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* User Info */}
            {user && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <User className="h-12 w-12 text-blue-600 bg-blue-100 rounded-full p-2" />
                    )}
                    <div>
                      <p className="font-semibold text-blue-900">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-sm text-blue-700">
                        {user.email || user.phoneNumber}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Auth Tabs */}
            {!user && (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="google">Google</TabsTrigger>
                  <TabsTrigger value="phone">Phone</TabsTrigger>
                </TabsList>

                {/* Google */}
                <TabsContent value="google">
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full bg-white text-gray-700 border"
                    size="lg"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    ) : (
                      <Mail className="h-5 w-5 mr-3 text-red-500" />
                    )}
                    {isLoading ? "Signing in..." : "Sign in with Google"}
                  </Button>
                </TabsContent>

                {/* Phone (UI only) */}
                <TabsContent value="phone" className="space-y-4">
                  {!otpSent ? (
                    <>
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+91 9876543210"
                        />
                      </div>

                      <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800 text-sm">
                          Phone authentication backend not enabled yet.
                          Please use Google sign-in.
                        </AlertDescription>
                      </Alert>

                      <Button disabled className="w-full">
                        <Phone className="h-5 w-5 mr-2" />
                        Send OTP
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                      />
                    </>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {/* Guest */}
            {!user && (
              <Button
                onClick={handleContinueAsGuest}
                variant="outline"
                className="w-full"
              >
                Continue as Guest
              </Button>
            )}

            {/* Security Notice */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lock className="h-5 w-5 text-gray-600 mt-0.5" />
                <p className="text-xs text-gray-600">
                  Authentication is secured using Firebase. We never store
                  passwords.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
