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
  Users,
  Plus,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  FlameIcon as Fire,
  Heart,
  Car,
  Cloud,
  Shield,
  Building,
  Eye,
  ThumbsUp,
  MessageSquare,
} from "lucide-react"
import { crowdsourceAlertsService, type CrowdsourceAlert } from "@/lib/crowdsource-alerts"

export default function CrowdsourceAlertsPage() {
  const [alerts, setAlerts] = useState<CrowdsourceAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<CrowdsourceAlert | null>(null)
  const [showSubmitForm, setShowSubmitForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    type: "other" as CrowdsourceAlert["type"],
    title: "",
    description: "",
    severity: "medium" as CrowdsourceAlert["severity"],
    reporterName: "",
    reporterPhone: "",
  })

  useEffect(() => {
    initializeCrowdsource()
  }, [])

  const initializeCrowdsource = async () => {
    setIsLoading(true)
    try {
      const result = await crowdsourceAlertsService.initialize()
      setIsInitialized(result.success)

      if (result.success) {
        // Register callback for new alerts
        crowdsourceAlertsService.onNewAlert((alert) => {
          setAlerts((prev) => [alert, ...prev.slice(0, 19)]) // Keep last 20
        })

        // Load active alerts
        const activeAlerts = crowdsourceAlertsService.getActiveAlerts()
        setAlerts(activeAlerts)
      }
    } catch (error) {
      console.error("Crowdsource initialization error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAlert = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in title and description")
      return
    }

    setIsLoading(true)
    try {
      const result = await crowdsourceAlertsService.submitAlert({
        type: formData.type,
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        reportedBy: {
          name: formData.reporterName || "Anonymous",
          phone: formData.reporterPhone,
          isVerified: false,
        },
      })

      if (result.success) {
        // Reset form
        setFormData({
          type: "other",
          title: "",
          description: "",
          severity: "medium",
          reporterName: "",
          reporterPhone: "",
        })
        setShowSubmitForm(false)

        // Refresh alerts
        const activeAlerts = crowdsourceAlertsService.getActiveAlerts()
        setAlerts(activeAlerts)
      } else {
        alert(`Failed to submit alert: ${result.error}`)
      }
    } catch (error) {
      console.error("Submit alert error:", error)
      alert("Error submitting alert")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAlert = async (alertId: string) => {
    const result = await crowdsourceAlertsService.verifyAlert(alertId, "current-user-id")
    if (result.success) {
      // Refresh alerts
      const activeAlerts = crowdsourceAlertsService.getActiveAlerts()
      setAlerts(activeAlerts)
    }
  }

  const getAlertIcon = (type: CrowdsourceAlert["type"]) => {
    switch (type) {
      case "fire":
        return <Fire className="h-5 w-5 text-red-600" />
      case "medical":
        return <Heart className="h-5 w-5 text-red-600" />
      case "accident":
        return <Car className="h-5 w-5 text-orange-600" />
      case "weather":
        return <Cloud className="h-5 w-5 text-blue-600" />
      case "crime":
        return <Shield className="h-5 w-5 text-purple-600" />
      case "infrastructure":
        return <Building className="h-5 w-5 text-gray-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getSeverityColor = (severity: CrowdsourceAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getStatusColor = (status: CrowdsourceAlert["status"]) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-blue-100 text-blue-800"
      case "false_alarm":
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crowdsource Alerts</h1>
          <p className="text-gray-600">Community-driven emergency reporting and verification system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls & Stats */}
          <div className="space-y-6">
            <Card className={isInitialized ? "border-green-200 bg-green-50" : "border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    System Status
                  </div>
                  <Badge variant={isInitialized ? "default" : "secondary"}>
                    {isInitialized ? "Active" : "Starting"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Active Alerts</span>
                    <span className="font-medium">{alerts.filter((a) => a.status !== "resolved").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified Alerts</span>
                    <span className="font-medium">{alerts.filter((a) => a.status === "verified").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Verification</span>
                    <span className="font-medium">{alerts.filter((a) => a.status === "pending").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Reports</span>
                    <span className="font-medium">{alerts.length}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowSubmitForm(!showSubmitForm)}
                  className="w-full mt-4"
                  disabled={!isInitialized}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Report New Alert
                </Button>
              </CardContent>
            </Card>

            {/* Submit Form */}
            {showSubmitForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit New Alert</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Alert Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fire">Fire</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="accident">Accident</SelectItem>
                          <SelectItem value="weather">Weather</SelectItem>
                          <SelectItem value="crime">Crime</SelectItem>
                          <SelectItem value="infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="severity">Severity</Label>
                      <Select
                        value={formData.severity}
                        onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                      >
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
                    <Label htmlFor="title">Alert Title</Label>
                    <Input
                      id="title"
                      placeholder="Brief description of the situation"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of what's happening"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reporterName">Your Name (Optional)</Label>
                      <Input
                        id="reporterName"
                        placeholder="Anonymous"
                        value={formData.reporterName}
                        onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="reporterPhone">Phone (Optional)</Label>
                      <Input
                        id="reporterPhone"
                        placeholder="+1234567890"
                        value={formData.reporterPhone}
                        onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleSubmitAlert} disabled={isLoading} className="flex-1">
                      {isLoading ? "Submitting..." : "Submit Alert"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowSubmitForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Usage Guide */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Report:</strong> Community members submit alerts about emergencies they witness
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Verify:</strong> Other users can verify alerts to increase credibility
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Notify:</strong> Verified alerts automatically notify emergency services
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Track:</strong> Follow alert status and updates in real-time
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts List */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 mb-4">No community alerts yet</p>
                      <Button onClick={() => setShowSubmitForm(true)} disabled={!isInitialized}>
                        Submit First Alert
                      </Button>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <Card
                        key={alert.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedAlert?.id === alert.id ? "ring-2 ring-blue-500" : ""
                        }`}
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getAlertIcon(alert.type)}
                              <div>
                                <h3 className="font-medium">{alert.title}</h3>
                                <p className="text-sm text-gray-600">by {alert.reportedBy.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                              <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mb-3">{alert.description}</p>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{alert.location.address}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{alert.timestamp.toLocaleTimeString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{alert.verificationCount}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleVerifyAlert(alert.id)
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                Verify
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Alert View */}
            {selectedAlert && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Alert Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Alert Info */}
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        {getAlertIcon(selectedAlert.type)}
                        <h3 className="text-lg font-medium">{selectedAlert.title}</h3>
                        <Badge className={getSeverityColor(selectedAlert.severity)}>{selectedAlert.severity}</Badge>
                        <Badge className={getStatusColor(selectedAlert.status)}>{selectedAlert.status}</Badge>
                      </div>
                      <p className="text-gray-700 mb-4">{selectedAlert.description}</p>
                    </div>

                    {/* Reporter Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium mb-2">Reported By</h4>
                      <div className="flex items-center space-x-2 text-sm">
                        <span>{selectedAlert.reportedBy.name}</span>
                        {selectedAlert.reportedBy.isVerified && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{selectedAlert.timestamp.toLocaleString()}</div>
                    </div>

                    {/* Location & Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium mb-2">Location</h4>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{selectedAlert.location.address}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Affected radius: {selectedAlert.affectedRadius}m
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-medium mb-2">Emergency Services</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <span>Police:</span>
                            <Badge variant={selectedAlert.emergencyServices.police ? "default" : "secondary"}>
                              {selectedAlert.emergencyServices.police ? "Needed" : "Not needed"}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Fire:</span>
                            <Badge variant={selectedAlert.emergencyServices.fire ? "default" : "secondary"}>
                              {selectedAlert.emergencyServices.fire ? "Needed" : "Not needed"}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Medical:</span>
                            <Badge variant={selectedAlert.emergencyServices.medical ? "default" : "secondary"}>
                              {selectedAlert.emergencyServices.medical ? "Needed" : "Not needed"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verification */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium mb-2">Community Verification</h4>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span>{selectedAlert.verificationCount} people have verified this alert</span>
                          {selectedAlert.verifiedBy.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Verified by: {selectedAlert.verifiedBy.slice(0, 3).join(", ")}
                              {selectedAlert.verifiedBy.length > 3 &&
                                ` and ${selectedAlert.verifiedBy.length - 3} others`}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyAlert(selectedAlert.id)}
                          disabled={selectedAlert.verifiedBy.includes("current-user-id")}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {selectedAlert.verifiedBy.includes("current-user-id") ? "Verified" : "Verify"}
                        </Button>
                      </div>
                    </div>

                    {/* Updates */}
                    {selectedAlert.updates.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Updates</h4>
                        <div className="space-y-2">
                          {selectedAlert.updates.map((update) => (
                            <Alert key={update.id}>
                              <MessageSquare className="h-4 w-4" />
                              <AlertDescription>
                                <div className="flex items-center justify-between">
                                  <span>{update.message}</span>
                                  <span className="text-xs text-gray-500">{update.timestamp.toLocaleTimeString()}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">by {update.updatedBy}</div>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
