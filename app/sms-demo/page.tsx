"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Send,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Phone,
  Users,
  Zap,
} from "lucide-react"
import { offlineSMSService } from "@/lib/offline-sms-service"
import { SMSStatus } from "@/components/sms-status"

export default function SMSDemoPage() {
  const [phoneNumber, setPhoneNumber] = useState("+1234567890")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"emergency" | "weather" | "community" | "health">("community")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<
    Array<{
      id: string
      type: string
      message: string
      timestamp: Date
      status: "success" | "error" | "queued"
      details?: string
    }>
  >([])

  const [smsStatus, setSmsStatus] = useState({
    isOnline: true,
    isInitialized: false,
    queueCount: 0,
  })

  useEffect(() => {
    initializeSMS()

    // Update status every 3 seconds
    const interval = setInterval(updateSMSStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  const initializeSMS = async () => {
    try {
      const result = await offlineSMSService.initialize()
      console.log("SMS Service initialized:", result)
      updateSMSStatus()
    } catch (error) {
      console.error("SMS initialization error:", error)
    }
  }

  const updateSMSStatus = () => {
    const status = offlineSMSService.getQueueStatus()
    setSmsStatus({
      isOnline: status.isOnline,
      isInitialized: status.isInitialized,
      queueCount: status.stats.pending,
    })
  }

  const addResult = (type: string, message: string, status: "success" | "error" | "queued", details?: string) => {
    const newResult = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      status,
      details,
    }
    setResults((prev) => [newResult, ...prev.slice(0, 9)]) // Keep last 10 results
  }

  // Example 1: Send a simple SMS
  const handleSendSimpleSMS = async () => {
    if (!message.trim() || !phoneNumber.trim()) {
      addResult("Simple SMS", "Please enter both phone number and message", "error")
      return
    }

    setIsLoading(true)
    try {
      const smsAlert = {
        id: `simple-${Date.now()}`,
        phoneNumber,
        message,
        type: messageType,
        priority,
        timestamp: new Date(),
        status: "pending" as const,
        retryCount: 0,
      }

      // Queue the SMS
      const result = await (offlineSMSService as any).queueSMS(smsAlert)

      if (result.success) {
        addResult(
          "Simple SMS",
          `Message sent to ${phoneNumber}`,
          result.queued ? "queued" : "success",
          result.queued ? "Message queued for offline delivery" : "Message sent immediately",
        )
        setMessage("")
      } else {
        addResult("Simple SMS", `Failed: ${result.error}`, "error")
      }
    } catch (error) {
      addResult("Simple SMS", `Error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    } finally {
      setIsLoading(false)
      updateSMSStatus()
    }
  }

  // Example 2: Send Emergency Alert
  const handleSendEmergencyAlert = async () => {
    setIsLoading(true)
    try {
      const result = await offlineSMSService.sendEmergencyAlert(
        phoneNumber,
        "123 Main Street, Downtown",
        "Medical emergency - person unconscious",
      )

      if (result.success) {
        addResult(
          "Emergency Alert",
          `Emergency alert sent to ${phoneNumber}`,
          result.queued ? "queued" : "success",
          result.queued ? "Alert queued - will send when online" : "Alert sent immediately",
        )
      } else {
        addResult("Emergency Alert", `Failed: ${result.error}`, "error")
      }
    } catch (error) {
      addResult("Emergency Alert", `Error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    } finally {
      setIsLoading(false)
      updateSMSStatus()
    }
  }

  // Example 3: Send Weather Alert to Multiple Recipients
  const handleSendWeatherAlert = async () => {
    setIsLoading(true)
    try {
      const recipients = ["+1234567890", "+1234567891", "+1234567892"]
      const weatherData = {
        type: "Severe Thunderstorm",
        description: "Heavy rain and strong winds expected. Seek shelter immediately.",
        severity: "severe",
        location: "Downtown Area",
      }

      const result = await offlineSMSService.sendWeatherAlert(recipients, weatherData)

      addResult(
        "Weather Alert",
        `Sent to ${result.sent} recipients, ${result.failed} failed, ${result.queued} queued`,
        result.sent > 0 ? "success" : "error",
        `Total recipients: ${recipients.length}`,
      )
    } catch (error) {
      addResult("Weather Alert", `Error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    } finally {
      setIsLoading(false)
      updateSMSStatus()
    }
  }

  // Example 4: Send Help Request SMS
  const handleSendHelpRequest = async () => {
    setIsLoading(true)
    try {
      const helpRequestData = {
        type: "medical",
        description: "Elderly person fell and cannot get up",
        urgency: "urgent",
        contact: phoneNumber,
        address: "456 Oak Avenue",
        city: "Springfield",
        state: "IL",
        requesterName: "John Doe",
      }

      const result = await offlineSMSService.sendHelpRequestSMS(helpRequestData)

      if (result.success) {
        addResult(
          "Help Request",
          `Help request sent to ${result.sentTo} contacts`,
          result.queued ? "queued" : "success",
          result.queued ? "Request queued for offline delivery" : "Volunteers and emergency contacts notified",
        )
      } else {
        addResult("Help Request", `Failed: ${result.error}`, "error")
      }
    } catch (error) {
      addResult("Help Request", `Error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    } finally {
      setIsLoading(false)
      updateSMSStatus()
    }
  }

  // Example 5: Test SMS
  const handleTestSMS = async () => {
    setIsLoading(true)
    try {
      const result = await offlineSMSService.sendTestSMS(phoneNumber)

      if (result.success) {
        addResult("Test SMS", `Test message sent to ${phoneNumber}`, "success", "SMS functionality verified")
      } else {
        addResult("Test SMS", `Failed: ${result.error}`, "error")
      }
    } catch (error) {
      addResult("Test SMS", `Error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    } finally {
      setIsLoading(false)
      updateSMSStatus()
    }
  }

  // Simulate going offline/online
  const toggleNetworkStatus = () => {
    // This is just for demo - in real app, network status is automatic
    const newStatus = !smsStatus.isOnline
    setSmsStatus((prev) => ({ ...prev, isOnline: newStatus }))

    addResult(
      "Network Status",
      `Simulated ${newStatus ? "online" : "offline"} mode`,
      "success",
      newStatus ? "Messages will be sent immediately" : "Messages will be queued for later",
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Offline SMS Demo</h1>
          <p className="text-gray-600">Complete examples of how to use the offline SMS service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SMS Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Network Status Card */}
            <Card className={smsStatus.isOnline ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    {smsStatus.isOnline ? (
                      <Wifi className="h-5 w-5 mr-2 text-green-600" />
                    ) : (
                      <WifiOff className="h-5 w-5 mr-2 text-red-600" />
                    )}
                    Network Status
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={smsStatus.isOnline ? "default" : "destructive"}>
                      {smsStatus.isOnline ? "Online" : "Offline"}
                    </Badge>
                    <Badge variant={smsStatus.isInitialized ? "default" : "secondary"}>
                      {smsStatus.isInitialized ? "Ready" : "Initializing"}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {smsStatus.isOnline
                        ? "SMS messages will be sent immediately"
                        : "SMS messages will be queued for later delivery"}
                    </p>
                    {smsStatus.queueCount > 0 && (
                      <p className="text-sm text-orange-600 mt-1">{smsStatus.queueCount} messages in queue</p>
                    )}
                  </div>
                  <Button onClick={toggleNetworkStatus} variant="outline" size="sm" className="ml-4 bg-transparent">
                    Simulate {smsStatus.isOnline ? "Offline" : "Online"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Basic SMS Form */}
            <Card>
              <CardHeader>
                <CardTitle>1. Send Basic SMS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="messageType">Message Type</Label>
                    <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="weather">Weather</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSendSimpleSMS}
                  disabled={isLoading || !smsStatus.isInitialized}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send SMS
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Pre-built Examples */}
            <Card>
              <CardHeader>
                <CardTitle>2. Pre-built SMS Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleSendEmergencyAlert}
                    disabled={isLoading || !smsStatus.isInitialized}
                    variant="destructive"
                    className="h-auto p-4 flex flex-col items-start"
                  >
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Emergency Alert
                    </div>
                    <p className="text-xs text-left opacity-90">Send critical emergency notification with location</p>
                  </Button>

                  <Button
                    onClick={handleSendWeatherAlert}
                    disabled={isLoading || !smsStatus.isInitialized}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start border-orange-200 hover:bg-orange-50 bg-transparent"
                  >
                    <div className="flex items-center mb-2">
                      <Zap className="h-5 w-5 mr-2 text-orange-600" />
                      Weather Alert
                    </div>
                    <p className="text-xs text-left text-gray-600">Broadcast weather warning to multiple recipients</p>
                  </Button>

                  <Button
                    onClick={handleSendHelpRequest}
                    disabled={isLoading || !smsStatus.isInitialized}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start border-blue-200 hover:bg-blue-50 bg-transparent"
                  >
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Help Request
                    </div>
                    <p className="text-xs text-left text-gray-600">Notify volunteers and emergency contacts</p>
                  </Button>

                  <Button
                    onClick={handleTestSMS}
                    disabled={isLoading || !smsStatus.isInitialized}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start border-green-200 hover:bg-green-50 bg-transparent"
                  >
                    <div className="flex items-center mb-2">
                      <Phone className="h-5 w-5 mr-2 text-green-600" />
                      Test SMS
                    </div>
                    <p className="text-xs text-left text-gray-600">Verify SMS functionality with test message</p>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Log */}
            <Card>
              <CardHeader>
                <CardTitle>3. SMS Results Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No SMS messages sent yet. Try the examples above!</p>
                  ) : (
                    results.map((result) => (
                      <Alert
                        key={result.id}
                        className={
                          result.status === "success"
                            ? "border-green-200 bg-green-50"
                            : result.status === "queued"
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-red-200 bg-red-50"
                        }
                      >
                        <div className="flex items-start space-x-2">
                          {result.status === "success" && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                          {result.status === "queued" && <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />}
                          {result.status === "error" && <XCircle className="h-4 w-4 text-red-600 mt-0.5" />}

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{result.type}</span>
                              <span className="text-xs text-gray-500">{result.timestamp.toLocaleTimeString()}</span>
                            </div>
                            <AlertDescription className="text-sm mt-1">{result.message}</AlertDescription>
                            {result.details && (
                              <AlertDescription className="text-xs mt-1 opacity-75">{result.details}</AlertDescription>
                            )}
                          </div>
                        </div>
                      </Alert>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SMS Status Sidebar */}
          <div>
            <SMSStatus />
          </div>
        </div>
      </div>
    </div>
  )
}
