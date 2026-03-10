"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { EmergencyAlert } from "@/components/emergency-alert"
import { QuickActionCard } from "@/components/quick-action-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Heart,
  Users,
  MapPin,
  Cloud,
  Phone,
  Shield,
  Zap,
  Mic,
  Brain,
  Wifi,
  MessageSquare,
  TreePine,
} from "lucide-react"
import { geoFencingService } from "@/lib/geo-fencing"
import { voiceCommandService } from "@/lib/voice-commands"
import { aiRiskPredictionService } from "@/lib/ai-risk-prediction"
import { crowdsourceAlertsService } from "@/lib/crowdsource-alerts"
import { offlineSMSService } from "@/lib/offline-sms-service"
import { i18nService } from "@/lib/i18n"
import { realTimeAlertsService } from "@/lib/realtime-alerts"

export default function HomePage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true)

  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [riskLevel, setRiskLevel] = useState(0)
  const [crowdsourceAlerts, setCrowdsourceAlerts] = useState(0)
  const [offlineStatus, setOfflineStatus] = useState({ isOnline: true, queuedMessages: 0 })
  const [geoFenceStatus, setGeoFenceStatus] = useState<string>("Inactive")
  const [translations, setTranslations] = useState<any>({})

  useEffect(() => {
    initializeAdvancedFeatures()
  }, [])

  const initializeAdvancedFeatures = async () => {
    try {
      // Initialize i18n first since it's required for UI
      await i18nService.initialize()
      updateTranslations()

      i18nService.onLanguageChange(() => {
        updateTranslations()
      })
    } catch (error) {
      console.error("❌ Failed to initialize i18n:", error)
    }

    // Fetch Real-time External Alerts
    const fetchAlerts = async () => {
      try {
        const liveAlerts = await realTimeAlertsService.fetchLiveAlerts()
        if (liveAlerts.length > 0) {
          // If we successfully fetched alerts, display them
          setAlerts(liveAlerts)
        } else {
          // Fallback if the fetch fails or finds nothing
          setAlerts([{
            id: 'fallback-1',
            type: "info",
            title: "No Active Emergencies",
            message: "There are currently no major active emergencies reported in your region. Stay safe.",
            timestamp: "Just now",
            address: "All Regions",
            situation: "All Clear"
          }])
        }
      } catch (err) {
        console.error("Failed fetching live alerts", err)
      } finally {
        setIsLoadingAlerts(false)
      }
    }
    fetchAlerts()

    // Initialize remaining services concurrently
    const initGeoFencing = async () => {
      try {
        const geoResult = await geoFencingService.initialize()
        if (geoResult.success) {
          setGeoFenceStatus("Active")
          geoFencingService.onFenceAlert((fence, action) => {
            const newAlert = {
              id: Date.now(),
              type: fence.severity === "critical" ? ("critical" as const) : ("warning" as const),
              title: `Geo-fence ${action}: ${fence.name}`,
              message: fence.alertMessage,
              timestamp: "Just now",
              address: "Your Current Location",
              situation: `Geo-fence ${action}`,
            }
            setAlerts((prev) => [newAlert, ...prev])
          })
        }
      } catch (e) {
        console.error("Geo-fencing failed", e)
      }
    }

    const initVoiceCommands = async () => {
      try {
        const voiceResult = await voiceCommandService.initialize()
        if (voiceResult.success) {
          console.log("✅ Voice commands available")
        }
      } catch (e) {
        console.error("Voice commands failed", e)
      }
    }

    const initAiRiskPrediction = async () => {
      try {
        const aiResult = await aiRiskPredictionService.initialize()
        if (aiResult.success) {
          aiRiskPredictionService.onRiskPrediction((prediction) => {
            setRiskLevel(prediction.overallRisk)
            if (prediction.overallRisk > 0.6) {
              const newAlert = {
                id: Date.now(),
                type: "warning" as const,
                title: "AI Risk Alert",
                message: prediction.recommendations[0] || "Elevated risk detected in your area",
                timestamp: "Just now",
                address: prediction.location.address || "Analyzed Location",
                situation: "Elevated Risk",
              }
              setAlerts((prev) => [newAlert, ...prev])
            }
          })
        }
      } catch (e) {
        console.error("AI Risk Prediction failed", e)
      }
    }

    const initCrowdsourceAlerts = async () => {
      try {
        const crowdsourceResult = await crowdsourceAlertsService.initialize()
        if (crowdsourceResult.success) {
          crowdsourceAlertsService.onNewAlert((alert) => {
            setCrowdsourceAlerts((prev) => prev + 1)
            const newAlert = {
              id: Date.now(),
              type: alert.severity === "critical" ? ("critical" as const) : ("warning" as const),
              title: alert.title,
              message: alert.description,
              timestamp: "Just now",
              address: alert.location.address || "Community Location",
              situation: alert.type || "Community Report",
            }
            setAlerts((prev) => [newAlert, ...prev])
          })
        }
      } catch (e) {
        console.error("Crowdsource alerts failed", e)
      }
    }

    const initOfflineSMS = async () => {
      try {
        const offlineResult = await offlineSMSService.initialize()
        if (offlineResult.success) {
          const status = offlineSMSService.getQueueStatus()
          setOfflineStatus({
            isOnline: status.isOnline,
            queuedMessages: status.smsQueue,
          })
        }
      } catch (e) {
        console.error("Offline SMS failed", e)
      }
    }

    // Fire them all off concurrently
    initGeoFencing()
    initVoiceCommands()
    initAiRiskPrediction()
    initCrowdsourceAlerts()
    initOfflineSMS()
  }

  const updateTranslations = () => {
    setTranslations({
      emergency: i18nService.t("emergency.emergency"),
      help: i18nService.t("emergency.help"),
      reportEmergency: i18nService.t("emergency.reportEmergency"),
      requestHelp: i18nService.t("emergency.requestHelp"),
      volunteer: i18nService.t("navigation.volunteer"),
      resources: i18nService.t("navigation.resources"),
      activeAlerts: i18nService.t("alerts.activeAlerts"),
      voiceActive: i18nService.t("voice.voiceActive"),
      enableVoice: i18nService.t("voice.enableVoice"),
      geofencing: i18nService.t("geofencing.enteredDangerZone"),
    })
  }

  const toggleVoiceCommands = () => {
    if (isVoiceActive) {
      voiceCommandService.stopListening()
      setIsVoiceActive(false)
    } else {
      voiceCommandService.startListening()
      setIsVoiceActive(true)
    }
  }

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const getRiskLevelColor = (risk: number) => {
    if (risk > 0.8) return "text-red-600"
    if (risk > 0.6) return "text-orange-600"
    if (risk > 0.4) return "text-yellow-600"
    return "text-green-600"
  }

  const getRiskLevelText = (risk: number) => {
    if (risk > 0.8) return "Critical"
    if (risk > 0.6) return "High"
    if (risk > 0.4) return "Medium"
    return "Low"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Alert and Assistance Network</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              AI-powered emergency response with advanced community features
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-red-600 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Advanced Features Status Bar */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Geo-fencing:</span>
                    <Badge variant={geoFenceStatus === "Active" ? "default" : "secondary"}>{geoFenceStatus}</Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Risk Level:</span>
                    <Badge className={getRiskLevelColor(riskLevel)}>
                      {getRiskLevelText(riskLevel)} ({(riskLevel * 100).toFixed(0)}%)
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Community Alerts:</span>
                    <Badge variant="outline">{crowdsourceAlerts}</Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={offlineStatus.isOnline ? "default" : "destructive"}>
                      {offlineStatus.isOnline ? "Online" : `Offline (${offlineStatus.queuedMessages} queued)`}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={toggleVoiceCommands}
                  variant={isVoiceActive ? "default" : "outline"}
                  size="sm"
                  className={isVoiceActive ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <Mic className={`h-4 w-4 mr-2 ${isVoiceActive ? "animate-pulse" : ""}`} />
                  {isVoiceActive
                    ? translations.voiceActive || "Voice Active"
                    : translations.enableVoice || "Enable Voice"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts */}
        {isLoadingAlerts ? (
          <div className="mb-8 flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-500 font-medium tracking-wide">Fetching live alerts...</span>
          </div>
        ) : alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
              {translations.activeAlerts || "Active Alerts"}
            </h2>
            {alerts.map((alert) => (
              <EmergencyAlert
                key={alert.id}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                timestamp={alert.timestamp}
                address={alert.address}
                situation={alert.situation}
                link={alert.link}
                onDismiss={() => dismissAlert(alert.id)}
              />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              icon={AlertTriangle}
              title={translations.reportEmergency || "Report Emergency"}
              description="Report an emergency situation in your area"
              variant="emergency"
              onClick={() => (window.location.href = "/help-requests")}
            />
            <QuickActionCard
              icon={Heart}
              title={translations.requestHelp || "Request Help"}
              description="Ask for assistance from community volunteers"
              variant="help"
              onClick={() => (window.location.href = "/help-requests")}
            />
            <QuickActionCard
              icon={Users}
              title={translations.volunteer || "Volunteer"}
              description="Help others in your community"
              variant="volunteer"
              onClick={() => (window.location.href = "/volunteer")}
            />
            <QuickActionCard
              icon={MapPin}
              title={translations.resources || "Find Resources"}
              description="Locate nearby medical, food, and shelter resources"
              variant="info"
              onClick={() => (window.location.href = "/resources")}
            />
          </div>
        </div>

        {/* New Advanced Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Advanced Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => (window.location.href = "/weather")}>
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <MapPin className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Smart Geo-Fencing</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Automatic alerts when entering or leaving danger zones like flood areas or evacuation zones.
                </p>
                <Badge variant="outline" className="text-xs">
                  Location-Based
                </Badge>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={toggleVoiceCommands}>
              <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Mic className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Voice Commands</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Hands-free emergency assistance. Just say "help me" or "emergency" to get immediate support.
                </p>
                <Badge variant="outline" className="text-xs">
                  Voice-Activated
                </Badge>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => (window.location.href = "/ai-prediction")}>
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Brain className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">AI Risk Prediction</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Predictive analytics using historical data to forecast potential risks and emergencies.
                </p>
                <Badge variant="outline" className="text-xs">
                  AI-Powered
                </Badge>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => (window.location.href = "/sms-demo")}>
              <div className="h-48 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Wifi className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Offline SMS Mode</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Critical alerts via SMS when internet is unavailable. Perfect for rural areas.
                </p>
                <Badge variant="outline" className="text-xs">
                  Offline-Ready
                </Badge>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => (window.location.href = "/crowdsource-alerts")}>
              <div className="h-48 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <MessageSquare className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Crowdsource Alerts</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Real-time community reporting of fires, accidents, and emergencies with instant verification.
                </p>
                <Badge variant="outline" className="text-xs">
                  Community-Driven
                </Badge>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => (window.location.href = "/contact-tree")}>
              <div className="h-48 bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <TreePine className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Emergency Contact Tree</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Automated escalation system that contacts multiple caregivers in priority order.
                </p>
                <Badge variant="outline" className="text-xs">
                  Auto-Escalation
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Grid with Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="overflow-hidden">
            <div className="h-48 bg-cover bg-center" style={{ backgroundImage: "url('/images/weather-alert.png')" }}>
              <div className="h-full bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div className="text-white">
                  <Zap className="h-6 w-6 mb-2" />
                  <h3 className="text-lg font-semibold">Real-Time Alerts</h3>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-gray-600">
                Receive instant notifications about emergencies, weather warnings, and community updates.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/community-support.png')" }}
            >
              <div className="h-full bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div className="text-white">
                  <Users className="h-6 w-6 mb-2" />
                  <h3 className="text-lg font-semibold">Community Support</h3>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-gray-600">
                Connect with local volunteers and neighbors who can provide assistance during emergencies.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/volunteer-helping.png')" }}
            >
              <div className="h-full bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div className="text-white">
                  <Cloud className="h-6 w-6 mb-2" />
                  <h3 className="text-lg font-semibold">Weather Updates</h3>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-gray-600">
                Stay informed with real-time weather conditions and automated severe weather alerts.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Community Impact Section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Making a Difference Together</h2>
                  <p className="text-gray-700 mb-6">
                    Our AI-powered community platform has revolutionized emergency response. From predictive alerts to
                    voice-activated assistance, we're building the future of community safety.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">1,247</div>
                      <div className="text-sm text-gray-600">People Helped</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">856</div>
                      <div className="text-sm text-gray-600">Volunteers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">24/7</div>
                      <div className="text-sm text-gray-600">AI Monitoring</div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src="/images/community-support.png"
                    alt="Community helping each other"
                    className="rounded-lg shadow-lg w-full h-64 object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contacts */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <Phone className="h-5 w-5 mr-2" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="font-semibold text-red-800">Police</p>
                <p className="text-2xl font-bold text-red-600">100</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-red-800">Fire Department</p>
                <p className="text-2xl font-bold text-red-600">101</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-red-800">Medical Emergency</p>
                <p className="text-2xl font-bold text-red-600">102</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-6 w-6" />
              <span className="text-lg font-semibold">Alert and Assistance Network</span>
            </div>
            <p className="text-gray-400 mb-4">
              AI-powered emergency response • Community-driven safety • Advanced predictive analytics
            </p>
            <p className="text-sm text-gray-500">
              Supporting UN SDGs: Good Health & Well-being • Innovation & Infrastructure • Sustainable Communities •
              Climate Action
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
