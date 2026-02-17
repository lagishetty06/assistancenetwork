"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Wifi, WifiOff, Clock, CheckCircle, XCircle, RefreshCw, Send, AlertTriangle } from "lucide-react"
import { offlineSMSService } from "@/lib/offline-sms-service"

export function SMSStatus() {
  const [status, setStatus] = useState({
    smsQueue: 0,
    offlineRequests: 0,
    isOnline: true,
    isInitialized: false,
    stats: { pending: 0, sent: 0, failed: 0 },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [testResult, setTestResult] = useState<string | null>(null)

  useEffect(() => {
    initializeSMSService()

    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const initializeSMSService = async () => {
    try {
      setIsLoading(true)
      const result = await offlineSMSService.initialize()

      if (result.success) {
        console.log("✅ SMS Service initialized")
      } else {
        console.error("❌ SMS Service initialization failed:", result.error)
      }

      updateStatus()
    } catch (error) {
      console.error("❌ SMS Service error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = () => {
    const currentStatus = offlineSMSService.getQueueStatus()
    setStatus(currentStatus)
  }

  const handleTestSMS = async () => {
    try {
      setTestResult("Sending test SMS...")

      // Use a demo phone number for testing
      const result = await offlineSMSService.sendTestSMS("+1234567890")

      if (result.success) {
        setTestResult("✅ Test SMS sent successfully!")
      } else {
        setTestResult(`❌ Test SMS failed: ${result.error}`)
      }

      updateStatus()

      // Clear test result after 5 seconds
      setTimeout(() => setTestResult(null), 5000)
    } catch (error) {
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setTimeout(() => setTestResult(null), 5000)
    }
  }

  const handleForceSync = async () => {
    try {
      setTestResult("Syncing queued messages...")

      // Trigger manual sync
      await (offlineSMSService as any).syncQueuedMessages()

      setTestResult("✅ Sync completed!")
      updateStatus()

      setTimeout(() => setTestResult(null), 3000)
    } catch (error) {
      setTestResult(`❌ Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setTimeout(() => setTestResult(null), 5000)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Initializing SMS Service...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            Offline SMS Status
          </div>
          <div className="flex items-center space-x-2">
            {status.isOnline ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            {status.isInitialized ? (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Not Ready
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Result */}
        {testResult && (
          <Alert
            className={testResult.includes("✅") ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{testResult}</AlertDescription>
          </Alert>
        )}

        {/* SMS Queue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{status.stats.pending}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{status.stats.sent}</div>
            <div className="text-sm text-green-600 flex items-center justify-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Sent
            </div>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{status.stats.failed}</div>
            <div className="text-sm text-red-600 flex items-center justify-center">
              <XCircle className="h-3 w-3 mr-1" />
              Failed
            </div>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{status.offlineRequests}</div>
            <div className="text-sm text-blue-600 flex items-center justify-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              Offline
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">How Offline SMS Works:</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <strong>Queue Messages:</strong> When offline, SMS messages are stored locally in your browser
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <strong>Auto-Sync:</strong> When connection returns, queued messages are automatically sent
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <strong>Retry Logic:</strong> Failed messages are retried up to 3 times with delays
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-600">4</span>
              </div>
              <div>
                <strong>Emergency Priority:</strong> Critical alerts are sent first when connection is restored
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button onClick={handleTestSMS} disabled={!status.isInitialized} className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Send Test SMS
          </Button>

          <Button
            onClick={handleForceSync}
            variant="outline"
            disabled={!status.isOnline || status.stats.pending === 0}
            className="flex-1 bg-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Sync ({status.stats.pending})
          </Button>
        </div>

        {/* Status Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• SMS messages are queued locally when offline</div>
          <div>• Emergency alerts have highest priority</div>
          <div>• Messages auto-sync every minute when online</div>
          <div>• Failed messages retry up to 3 times</div>
        </div>
      </CardContent>
    </Card>
  )
}
