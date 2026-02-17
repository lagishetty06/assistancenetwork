"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Heart, Clock, MapPin, Phone, CheckCircle, AlertCircle, User, Loader2, RefreshCw } from "lucide-react"
import { getHelpRequests, updateHelpRequestStatus, type HelpRequest } from "@/lib/firebase-services"

export default function VolunteerPage() {
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock volunteer ID - in a real app, this would come from authentication
  const volunteerId = "volunteer_123"
  const volunteerName = "John Volunteer"

  const fetchHelpRequests = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    setError(null)

    try {
      console.log("🔄 Fetching help requests with offline fallback...")
      const result = await getHelpRequests()

      if (result.success && result.data) {
        setHelpRequests(result.data)
        console.log("✅ Fetched help requests:", result.data.length, "requests")

        // Show offline status if applicable
        if (result.isOffline) {
          setError(`⚠️ Offline Mode: Showing cached data. ${result.message || "Some information may not be current."}`)
        }
      } else {
        setError("Failed to fetch help requests")
      }
    } catch (err) {
      console.error("❌ Error fetching help requests:", err)
      setError("An unexpected error occurred while fetching data. Using offline mode.")

      // Try to load offline data as last resort
      try {
        const offlineRequests = JSON.parse(localStorage.getItem("offlineHelpRequests") || "[]")
        if (offlineRequests.length > 0) {
          setHelpRequests(offlineRequests)
          setError("⚠️ Offline Mode: Showing locally stored requests only.")
        }
      } catch (offlineError) {
        console.error("Failed to load offline data:", offlineError)
      }
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHelpRequests()
  }, [])

  const handleRefresh = () => {
    fetchHelpRequests(true)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const result = await updateHelpRequestStatus(requestId, "accepted", volunteerId, volunteerName)
      if (result.success) {
        // Refresh the requests to show updated status
        fetchHelpRequests()
        alert("Request accepted! You can now contact the requester.")
      } else {
        alert("Failed to accept request. Please try again.")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    }
  }

  const handleCompleteRequest = async (requestId: string) => {
    try {
      const result = await updateHelpRequestStatus(requestId, "completed")
      if (result.success) {
        // Refresh the requests to show updated status
        fetchHelpRequests()
        alert("Request marked as completed. Thank you for helping!")
      } else {
        alert("Failed to complete request. Please try again.")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    }
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Unknown time"

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

      if (diffInMinutes < 1) return "Just now"
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    } catch {
      return "Unknown time"
    }
  }

  const handleGetDirections = (location: string) => {
    if (!location) return
    const encodedLocation = encodeURIComponent(location)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, "_blank")
  }

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) {
      alert("No phone number available for this request.")
      return
    }
    window.location.href = `tel:${phoneNumber}`
  }

  const pendingRequests = helpRequests.filter((r) => r.status === "pending")
  const myRequests = helpRequests.filter((r) => r.volunteerId === volunteerId)
  const completedThisMonth = helpRequests.filter(
    (r) => r.status === "completed" && r.volunteerId === volunteerId,
  ).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            <span className="ml-2 text-gray-600">Loading help requests...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Volunteer Dashboard</h1>
                <p className="text-gray-600">Help your community by responding to assistance requests</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {/* Add connection status */}
              <div className="text-xs text-gray-500">{error?.includes("Offline") ? "🔴 Offline" : "🟢 Online"}</div>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-8 bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Requests</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingRequests.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Active Requests</p>
                  <p className="text-2xl font-bold text-blue-600">{myRequests.length}</p>
                </div>
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed This Month</p>
                  <p className="text-2xl font-bold text-green-600">{completedThisMonth}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-purple-600">{helpRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available Requests ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="my-requests">My Requests ({myRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Available Help Requests</h2>
              <Badge variant="outline" className="text-sm">
                {pendingRequests.length} pending
              </Badge>
            </div>

            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No pending requests</h3>
                  <p className="text-gray-500">Check back later for new help requests from the community.</p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{request.type}</Badge>
                        <Badge className={getUrgencyColor(request.urgency)}>{request.urgency.toUpperCase()}</Badge>
                      </div>
                      <span className="text-sm text-gray-500">{formatTimestamp(request.createdAt)}</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{request.description}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{request.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{request.requesterName || "Anonymous"}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAcceptRequest(request.id!)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept Request
                      </Button>
                      <Button variant="outline" onClick={() => handleCall(request.contact)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button variant="outline" onClick={() => handleGetDirections(request.location)}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="my-requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Active Requests</h2>
              <Badge variant="outline" className="text-sm">
                {myRequests.length} active
              </Badge>
            </div>

            {myRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No active requests</h3>
                  <p className="text-gray-500">Accept some requests from the Available tab to get started!</p>
                </CardContent>
              </Card>
            ) : (
              myRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{request.type}</Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace("-", " ").toUpperCase()}
                        </Badge>
                        <Badge className={getUrgencyColor(request.urgency)}>{request.urgency.toUpperCase()}</Badge>
                      </div>
                      <span className="text-sm text-gray-500">{formatTimestamp(request.createdAt)}</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{request.description}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{request.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{request.requesterName || "Anonymous"}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{request.contact}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {request.status === "accepted" && (
                        <Button
                          onClick={() => handleCompleteRequest(request.id!)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => handleCall(request.contact)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call {request.requesterName || "Requester"}
                      </Button>
                      <Button variant="outline" onClick={() => handleGetDirections(request.location)}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Volunteer Guidelines */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Volunteer Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Safety First</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Always inform someone of your volunteer activities</li>
                  <li>• Meet in public places when possible</li>
                  <li>• Trust your instincts and prioritize your safety</li>
                  <li>• Don't provide financial assistance directly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Best Practices</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Communicate clearly with those you're helping</li>
                  <li>• Be reliable and follow through on commitments</li>
                  <li>• Respect privacy and maintain confidentiality</li>
                  <li>• Report any concerns to administrators</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
