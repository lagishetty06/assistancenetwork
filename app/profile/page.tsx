"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
} from "lucide-react"

// ✅ Firebase (SAFE)
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    address: "",
    bio: "",
  })

  // ✅ Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setFormData({
          displayName: currentUser.displayName || "",
          email: currentUser.email || "",
          phoneNumber: currentUser.phoneNumber || "",
          address: "",
          bio: "",
        })
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Simulated save (replace with Firestore later)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess("Profile updated successfully!")
      setIsEditing(false)
    } catch {
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    setSuccess(null)

    if (user) {
      setFormData({
        displayName: user.displayName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: "",
        bio: "",
      })
    }
  }

  // 🔐 Not logged in fallback
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-md mx-auto py-24 text-center">
          <h2 className="text-2xl font-semibold mb-4">You are not signed in</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your profile.
          </p>
          <Button asChild>
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <Card>
            <CardContent className="p-6 text-center">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto bg-red-100 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-red-600" />
                </div>
              )}
              <h3 className="text-xl font-semibold">{user.displayName}</h3>
              <p className="text-gray-600">{user.email || user.phoneNumber}</p>
              <div className="flex justify-center mt-4 text-sm text-gray-600 space-x-4">
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> Joined</span>
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> Location</span>
              </div>
            </CardContent>
          </Card>

          {/* Right */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex justify-between">
                <CardTitle>Profile Information</CardTitle>
                {!isEditing ? (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleSave} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.displayName}
                        onChange={(e) =>
                          setFormData({ ...formData, displayName: e.target.value })
                        }
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded">{formData.displayName}</div>
                    )}
                  </div>

                  <div>
                    <Label>Email</Label>
                    <div className="p-2 bg-gray-50 rounded flex items-center">
                      <Mail className="h-4 w-4 mr-2" /> {formData.email}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Bio</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded min-h-[80px]">
                      {formData.bio || "No bio added"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
