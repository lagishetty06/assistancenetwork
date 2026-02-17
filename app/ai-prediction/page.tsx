"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Wind,
  Droplets,
  Thermometer,
  Activity,
  MapPin,
  RefreshCw,
  Shield,
  Info,
  Bell,
  Smartphone
} from "lucide-react"
import { aiRiskPredictionService, type RiskPrediction, type RiskFactor } from "@/lib/ai-risk-prediction"
import { offlineSMSService } from "@/lib/offline-sms-service"

export default function AIPredictionPage() {
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [smsEnabled, setSmsEnabled] = useState(false)

  useEffect(() => {
    initializeAI()
    checkNotificationPermission()
  }, [])

  const checkNotificationPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true)
      }
    }
  }

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setNotificationsEnabled(true)
        new Notification("AI Risk Alerts Enabled", {
          body: "You will now receive alerts for high-risk predictions.",
          icon: "/icon.png"
        })
      }
    }
  }

  const toggleSMS = () => {
    setSmsEnabled(!smsEnabled)
    if (!smsEnabled) {
      // Simulate SMS preference saving
      // In a real app, this would save to user profile
      alert("Offline SMS alerts enabled. You will receive critical alerts via SMS.")
    }
  }

  const initializeAI = async () => {
    try {
      setLoading(true)
      const initResult = await aiRiskPredictionService.initialize()

      if (initResult.success) {
        // Get initial prediction
        if (typeof navigator !== "undefined" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const loc = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
              setLocation(loc)
              const result = await aiRiskPredictionService.predictRisk(loc.lat, loc.lng)
              setPrediction(result)
              setLoading(false)
              checkAndSendAlerts(result)
            },
            (error) => {
              console.error("Location error:", error)
              // Fallback to default location
              const defaultLoc = { lat: 40.7128, lng: -74.006 }
              setLocation(defaultLoc)
              aiRiskPredictionService.predictRisk(defaultLoc.lat, defaultLoc.lng).then((result) => {
                setPrediction(result)
                setLoading(false)
                checkAndSendAlerts(result)
              })
            },
          )
        } else {
          // Fallback
          const defaultLoc = { lat: 40.7128, lng: -74.006 }
          setLocation(defaultLoc)
          const result = await aiRiskPredictionService.predictRisk(defaultLoc.lat, defaultLoc.lng)
          setPrediction(result)
          setLoading(false)
          checkAndSendAlerts(result)
        }

        // Subscribe to updates
        aiRiskPredictionService.onRiskPrediction((newPrediction) => {
          setPrediction(newPrediction)
          checkAndSendAlerts(newPrediction)
        })
      }
    } catch (error) {
      console.error("Failed to initialize AI service:", error)
      setLoading(false)
    }
  }

  const checkAndSendAlerts = async (result: RiskPrediction) => {
    // Send alerts if risk is high or critical
    if (result.overallRisk > 0.6) {
      const riskLevel = result.overallRisk > 0.8 ? "CRITICAL" : "HIGH"
      const message = `⚠️ ${riskLevel} RISK ALERT: Potential ${result.factors[0]?.type || "hazard"} detected in your area. Please take precautions.`

      // Browser Notification
      if (notificationsEnabled && typeof window !== "undefined" && "Notification" in window) {
        new Notification(`AI Risk Alert: ${riskLevel}`, {
          body: message,
          icon: "/warning-icon.png",
          tag: "risk-alert"
        })
      }

      // Offline SMS (Simulated)
      if (smsEnabled) {
        try {
          // Verify we have network specific API before calling
          // This uses the offline-sms-service we fixed earlier
          await offlineSMSService.sendEmergencyAlert(
            "+911234567890", // In real app, get from user profile
            location ? `${location.lat.toFixed(4)},${location.lng.toFixed(4)}` : "Unknown Location",
            message
          )
          console.log("SMS alert sent successfully")
        } catch (error) {
          console.error("Failed to send SMS alert:", error)
        }
      }
    }
  }

  const handleRefresh = async () => {
    if (location) {
      setLoading(true)
      const result = await aiRiskPredictionService.predictRisk(location.lat, location.lng)
      setPrediction(result)
      checkAndSendAlerts(result)
      setTimeout(() => setLoading(false), 800) // Minimal delay for UX
    }
  }

  const handleManualAssessment = async () => {
    if (location) {
      const result = await aiRiskPredictionService.performRiskAssessment()
      if (result.success && result.prediction) {
        setPrediction(result.prediction)
        checkAndSendAlerts(result.prediction)
      }
    }
  }

  const getRiskColor = (level: number) => {
    if (level > 0.8) return "text-red-600"
    if (level > 0.6) return "text-orange-600"
    if (level > 0.4) return "text-yellow-600"
    return "text-green-600"
  }

  const getRiskBgColor = (level: number) => {
    if (level > 0.8) return "bg-red-100 text-red-800 border-red-200"
    if (level > 0.6) return "bg-orange-100 text-orange-800 border-orange-200"
    if (level > 0.4) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  const getRiskLabel = (level: number) => {
    if (level > 0.8) return "Critical Risk"
    if (level > 0.6) return "High Risk"
    if (level > 0.4) return "Medium Risk"
    return "Low Risk"
  }

  const getFactorIcon = (type: string) => {
    switch (type) {
      case "weather":
        return <Wind className="h-5 w-5" />
      case "flood":
        return <Droplets className="h-5 w-5" />
      case "fire":
        return <Thermometer className="h-5 w-5" />
      case "infrastructure":
        return <Activity className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Analyzing Risk Factors...</h2>
            <p className="text-gray-500 mt-2">Processing real-time data from multiple sources</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Brain className="h-8 w-8 mr-3 text-purple-600" />
              AI Risk Prediction
            </h1>
            <p className="text-gray-600 mt-1">
              Advanced predictive analytics for community safety and emergency preparedness
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleManualAssessment}>
              <Activity className="h-4 w-4 mr-2" />
              Run Assessment
            </Button>
            <Button onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Alert Settings */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-900">Proactive Alerts</h3>
                <p className="text-sm text-blue-700">Stay informed about sudden natural disasters and risks</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant={notificationsEnabled ? "secondary" : "default"}
                onClick={requestNotificationPermission}
                disabled={notificationsEnabled}
                className="whitespace-nowrap"
              >
                <Bell className="h-4 w-4 mr-2" />
                {notificationsEnabled ? "Browser Alerts On" : "Enable Browser Alerts"}
              </Button>
              <Button
                variant={smsEnabled ? "secondary" : "outline"}
                onClick={toggleSMS}
                className="whitespace-nowrap"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                {smsEnabled ? "SMS Alerts On" : "Enable SMS Alerts"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {prediction && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Risk Score Card */}
            <Card className="lg:col-span-1 border-t-4 border-t-purple-600 shadow-md">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Overall Risk Level
                  <Shield className="h-5 w-5 text-gray-400" />
                </CardTitle>
                <CardDescription>Based on {prediction.factors.length} analyzed factors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative h-40 w-40 flex items-center justify-center mb-4">
                    {/* Circular progress visual */}
                    <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={
                          prediction.overallRisk > 0.8
                            ? "#dc2626"
                            : prediction.overallRisk > 0.6
                              ? "#ea580c"
                              : prediction.overallRisk > 0.4
                                ? "#ca8a04"
                                : "#16a34a"
                        }
                        strokeWidth="10"
                        strokeDasharray={`${prediction.overallRisk * 283} 283`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${getRiskColor(prediction.overallRisk)}`}>
                        {(prediction.overallRisk * 100).toFixed(0)}%
                      </span>
                      <span className="text-sm font-medium text-gray-500">{getRiskLabel(prediction.overallRisk)}</span>
                    </div>
                  </div>

                  <div className="w-full space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Confidence Score</span>
                      <span className="font-medium">{(prediction.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={prediction.confidenceScore * 100} className="h-2" />
                  </div>

                  <div className="mt-6 w-full p-3 bg-gray-50 rounded-lg text-sm text-center text-gray-600">
                    Last updated: {prediction.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="factors" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="factors">Risk Factors</TabsTrigger>
                  <TabsTrigger value="history">Historical Data</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="factors" className="mt-4 space-y-4">
                  {prediction.factors.map((factor, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="flex items-start p-4">
                        <div
                          className={`p-3 rounded-full mr-4 ${factor.riskLevel === "high" || factor.riskLevel === "critical"
                            ? "bg-red-100 text-red-600"
                            : factor.riskLevel === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                            }`}
                        >
                          {getFactorIcon(factor.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-gray-900 capitalize">{factor.type.replace("_", " ")}</h3>
                            <Badge variant="outline" className={getRiskBgColor(factor.probability)}>
                              {factor.riskLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Probability: {(factor.probability * 100).toFixed(0)}%
                            <span className="mx-2">•</span>
                            Source: {factor.source}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="recommendations" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI-Generated Recommendations</CardTitle>
                      <CardDescription>Actionable steps based on current risk analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {prediction.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <div className="bg-blue-100 p-1 rounded-full text-blue-600 mr-3 mt-0.5">
                              <Info className="h-4 w-4" />
                            </div>
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Safety Tip
                        </h4>
                        <p className="text-sm text-blue-700">
                          Always verify AI predictions with official local alerts and emergency broadcasts. Predicted
                          risks are estimates based on available data.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Historical Comparison</CardTitle>
                      <CardDescription>
                        Comparing current data with past events in this region ({location?.lat.toFixed(2)},{" "}
                        {location?.lng.toFixed(2)})
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-l-4 border-l-blue-500 pl-4 py-1">
                          <p className="text-sm text-gray-500">1 year ago</p>
                          <p className="font-medium">Severe flooding (Risk Level: Critical)</p>
                        </div>
                        <div className="border-l-4 border-l-green-500 pl-4 py-1">
                          <p className="text-sm text-gray-500">6 months ago</p>
                          <p className="font-medium">Normal conditions (Risk Level: Low)</p>
                        </div>
                        <div className="border-l-4 border-l-yellow-500 pl-4 py-1">
                          <p className="text-sm text-gray-500">3 months ago</p>
                          <p className="font-medium">Minor infrastructure issues (Risk Level: Medium)</p>
                        </div>
                      </div>
                      <div className="mt-6 text-center">
                        <Button variant="ghost" size="sm">
                          View Full History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {!prediction && !loading && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Analysis Pending</h3>
            <p className="text-gray-500 mb-6">
              Unable to generate risk prediction at this time. Please try refreshing or check your location settings.
            </p>
            <Button onClick={handleRefresh}>Retry Analysis</Button>
          </div>
        )}
      </div>
    </div>
  )
}
