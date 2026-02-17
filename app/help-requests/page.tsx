"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Heart,
  Phone,
  Clock,
  CheckCircle,
  Loader2,
  User,
  MapPin,
  Wifi,
  WifiOff,
  Timer,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { submitHelpRequest, checkFirebaseConnection } from "@/lib/firebase-services"
import { offlineSMSService } from "@/lib/offline-sms-service"

export default function HelpRequestsPage() {
  const [formData, setFormData] = useState({
    // Personal Information
    requesterName: "",
    age: "",
    gender: "",
    contact: "",
    alternateContact: "",
    email: "",

    // Request Details
    type: "",
    description: "",
    urgency: "",

    // Location Information
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",

    // Additional Details
    numberOfPeople: "",
    hasChildren: false,
    hasElderly: false,
    hasDisabled: false,
    medicalConditions: "",

    // Timing
    preferredTime: "",
    availableUntil: "",

    // Resources
    resourcesNeeded: "",
    transportationNeeded: false,
    accommodationNeeded: false,

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Additional Information
    additionalNotes: "",
    consentToShare: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [connectionSpeed, setConnectionSpeed] = useState<number | null>(null)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
    troubleshooting?: string
    duration?: number
  }>({ type: null, message: "" })

  // Check Firebase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      console.log("🔍 Checking Firebase connection...")
      const result = await checkFirebaseConnection()

      setConnectionStatus(result.success ? "connected" : "disconnected")
      setConnectionSpeed(result.duration || null)

      if (!result.success) {
        setSubmitStatus({
          type: "error",
          message: `⚠️ Connection issue: ${result.error}`,
          troubleshooting: "Please check your internet connection and refresh the page.",
          duration: result.duration,
        })
      } else {
        console.log(`✅ Connection established in ${result.duration}ms`)
      }
    }

    checkConnection()
  }, [])

  const handleRetryConnection = async () => {
    setConnectionStatus("checking")
    setSubmitStatus({ type: null, message: "" })

    const result = await checkFirebaseConnection()
    setConnectionStatus(result.success ? "connected" : "disconnected")
    setConnectionSpeed(result.duration || null)

    if (result.success) {
      setSubmitStatus({
        type: "success",
        message: `✅ Connection restored! Ready to submit requests.`,
        duration: result.duration,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitProgress(0)
    setSubmitStatus({ type: null, message: "" })

    try {
      // Progress: Validation
      setSubmitProgress(15)
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Validate required fields
      const requiredFields = ["requesterName", "contact", "type", "description", "urgency", "address", "city", "state"]
      const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

      if (missingFields.length > 0) {
        setSubmitStatus({
          type: "error",
          message: `❌ Please fill in all required fields: ${missingFields.join(", ")}`,
        })
        setIsSubmitting(false)
        setSubmitProgress(0)
        return
      }

      if (!formData.consentToShare) {
        setSubmitStatus({
          type: "error",
          message: "❌ Please consent to sharing your information with volunteers.",
        })
        setIsSubmitting(false)
        setSubmitProgress(0)
        return
      }

      // Progress: Data preparation
      setSubmitProgress(30)
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Prepare optimized data for Firebase
      const requestData = {
        type: formData.type,
        description: formData.description,
        urgency: formData.urgency,
        requesterName: formData.requesterName,
        age: formData.age || undefined,
        gender: formData.gender || undefined,
        contact: formData.contact,
        alternateContact: formData.alternateContact || undefined,
        email: formData.email || undefined,
        location: `${formData.address}, ${formData.city}, ${formData.state}`,
        address: formData.address,
        landmark: formData.landmark || undefined,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode || undefined,
        numberOfPeople: formData.numberOfPeople || undefined,
        hasChildren: formData.hasChildren || undefined,
        hasElderly: formData.hasElderly || undefined,
        hasDisabled: formData.hasDisabled || undefined,
        medicalConditions: formData.medicalConditions || undefined,
        preferredTime: formData.preferredTime || undefined,
        availableUntil: formData.availableUntil || undefined,
        resourcesNeeded: formData.resourcesNeeded || undefined,
        transportationNeeded: formData.transportationNeeded || undefined,
        accommodationNeeded: formData.accommodationNeeded || undefined,
        emergencyContact: {
          name: formData.emergencyContactName || undefined,
          phone: formData.emergencyContactPhone || undefined,
          relation: formData.emergencyContactRelation || undefined,
        },
        additionalNotes: formData.additionalNotes || undefined,
        consentToShare: formData.consentToShare,
        submissionTimestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }

      // Progress: Submitting to Firebase
      setSubmitProgress(50)
      console.log("🚀 Submitting optimized help request...")

      const result = await submitHelpRequest(requestData)

      // Progress: Processing response
      setSubmitProgress(90)
      await new Promise((resolve) => setTimeout(resolve, 300))

      if (result.success) {
        setSubmitProgress(95)

        // Send SMS notifications to emergency contacts and volunteers
        try {
          const smsResult = await offlineSMSService.sendHelpRequestSMS(requestData)
          console.log(`📱 SMS notifications: sent to ${smsResult.sentTo} recipients`)
        } catch (smsError) {
          console.warn("⚠️ SMS notification failed:", smsError)
          // Don't fail the entire submission if SMS fails
        }

        setSubmitProgress(100)
        setSubmitStatus({
          type: "success",
          message: `✅ Help request submitted successfully! 
        
📄 Request ID: ${result.id}
⏱️ Submission time: ${result.duration}ms

Your request has been saved and volunteers will be notified. You should receive contact based on your urgency level.

Thank you for using the Alert and Assistance Network!`,
          duration: result.duration,
        })

        // Reset form after successful submission
        setFormData({
          requesterName: "",
          age: "",
          gender: "",
          contact: "",
          alternateContact: "",
          email: "",
          type: "",
          description: "",
          urgency: "",
          address: "",
          landmark: "",
          city: "",
          state: "",
          pincode: "",
          numberOfPeople: "",
          hasChildren: false,
          hasElderly: false,
          hasDisabled: false,
          medicalConditions: "",
          preferredTime: "",
          availableUntil: "",
          resourcesNeeded: "",
          transportationNeeded: false,
          accommodationNeeded: false,
          emergencyContactName: "",
          emergencyContactPhone: "",
          emergencyContactRelation: "",
          additionalNotes: "",
          consentToShare: false,
        })

        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        setSubmitProgress(0)
        setSubmitStatus({
          type: "error",
          message: `❌ Submission failed: ${result.error}`,
          troubleshooting: result.troubleshooting,
          duration: result.duration,
        })
      }
    } catch (error) {
      console.error("❌ Unexpected error during form submission:", error)
      setSubmitProgress(0)
      setSubmitStatus({
        type: "error",
        message: `❌ Unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
        troubleshooting: `
Please try the following:
1. Refresh the page and try again
2. Check your internet connection
3. Clear your browser cache
4. For urgent matters, call emergency services: 100/101/108`,
      })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitProgress(0), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Help</h1>
          <p className="text-gray-600">Optimized form with faster submission</p>

          {/* Connection Status */}
          <div className="mt-4 flex items-center justify-center space-x-2">
            {connectionStatus === "checking" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">Testing connection...</span>
              </>
            )}
            {connectionStatus === "connected" && (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Connected ({connectionSpeed}ms)</span>
              </>
            )}
            {connectionStatus === "disconnected" && (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">Connection failed</span>
                <Button size="sm" variant="outline" onClick={handleRetryConnection}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Optimized Request Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Optimized Help Request Form
                  {isSubmitting && (
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600">Processing...</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Submission Progress */}
                {isSubmitting && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Submission Progress</span>
                      <span className="text-sm text-gray-500">{submitProgress}%</span>
                    </div>
                    <Progress value={submitProgress} className="h-2" />
                    <div className="mt-2 text-xs text-gray-500">
                      {submitProgress < 30 && "Validating form data..."}
                      {submitProgress >= 30 && submitProgress < 50 && "Optimizing data for submission..."}
                      {submitProgress >= 50 && submitProgress < 90 && "Submitting to database with retry logic..."}
                      {submitProgress >= 90 && "Processing response..."}
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {submitStatus.type && (
                  <Alert
                    className={`mb-6 ${
                      submitStatus.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {submitStatus.type === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <AlertDescription className="whitespace-pre-line text-sm">
                          {submitStatus.message}
                        </AlertDescription>
                        {submitStatus.troubleshooting && (
                          <AlertDescription className="mt-3 text-xs opacity-75 whitespace-pre-line">
                            {submitStatus.troubleshooting}
                          </AlertDescription>
                        )}
                        {submitStatus.duration && (
                          <div className="mt-2 text-xs opacity-75">Performance: {submitStatus.duration}ms</div>
                        )}
                      </div>
                    </div>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Essential Information Only - Simplified Form */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Essential Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="requesterName">Full Name *</Label>
                        <Input
                          id="requesterName"
                          placeholder="Enter your full name"
                          value={formData.requesterName}
                          onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact">Phone Number *</Label>
                        <Input
                          id="contact"
                          placeholder="Your phone number"
                          value={formData.contact}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type of Help Needed *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select help type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medical">Medical Assistance</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="supplies">Food/Supplies</SelectItem>
                            <SelectItem value="shelter">Temporary Shelter</SelectItem>
                            <SelectItem value="evacuation">Evacuation Help</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="urgency">Urgency Level *</Label>
                        <Select
                          value={formData.urgency}
                          onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical - Immediate</SelectItem>
                            <SelectItem value="urgent">Urgent - Within 1 hour</SelectItem>
                            <SelectItem value="moderate">Moderate - Within 4 hours</SelectItem>
                            <SelectItem value="low">Low - Within 24 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description of Help Needed *</Label>
                      <Textarea
                        id="description"
                        placeholder="Briefly describe what help you need..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Location
                    </h3>

                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        placeholder="Your complete address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="City name"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          placeholder="State name"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consent */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="consentToShare"
                        checked={formData.consentToShare}
                        onCheckedChange={(checked) => setFormData({ ...formData, consentToShare: !!checked })}
                        required
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="consentToShare" className="text-sm">
                        I consent to sharing my information with verified volunteers for assistance. *
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isSubmitting || connectionStatus === "disconnected"}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting... ({submitProgress}%)
                      </>
                    ) : connectionStatus === "disconnected" ? (
                      <>
                        <WifiOff className="h-4 w-4 mr-2" />
                        Connection Required
                      </>
                    ) : (
                      "Submit Help Request"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Optimizations Applied</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-blue-700">
                <p>✅ Simplified form with essential fields only</p>
                <p>✅ Retry logic with exponential backoff</p>
                <p>✅ Shorter timeouts (8s instead of 15s)</p>
                <p>✅ Data optimization before submission</p>
                <p>✅ Real-time connection monitoring</p>
                <p>✅ Detailed error messages with solutions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Expected Response Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Critical</span>
                  <span className="text-sm font-semibold text-red-600">5-15 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Urgent</span>
                  <span className="text-sm font-semibold text-orange-600">15-60 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Moderate</span>
                  <span className="text-sm font-semibold text-yellow-600">1-4 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Low Priority</span>
                  <span className="text-sm font-semibold text-green-600">4-24 hours</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 mb-3">For life-threatening emergencies, call immediately:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Police:</span>
                    <span className="font-semibold">100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fire/Ambulance:</span>
                    <span className="font-semibold">101/108</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disaster Management:</span>
                    <span className="font-semibold">1070</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
