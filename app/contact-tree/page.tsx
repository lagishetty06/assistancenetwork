"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Phone,
  Plus,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Mail,
  User,
  Heart,
  Shield,
  Zap,
  PlayCircle,
  StopCircle,
} from "lucide-react"
import {
  emergencyContactTreeService,
  type EmergencyContact,
  type EmergencyEscalation,
} from "@/lib/emergency-contact-tree"

export default function ContactTreePage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [escalations, setEscalations] = useState<EmergencyEscalation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [selectedEscalation, setSelectedEscalation] = useState<EmergencyEscalation | null>(null)

  // Form state for adding contacts
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "family" as EmergencyContact["relationship"],
    priority: 1,
    preferredContactMethod: "call" as EmergencyContact["preferredContactMethod"],
    specialInstructions: "",
  })

  useEffect(() => {
    initializeContactTree()
  }, [])

  const initializeContactTree = async () => {
    setIsLoading(true)
    try {
      const result = await emergencyContactTreeService.initialize()
      setIsInitialized(result.success)

      if (result.success) {
        // Register callback for escalation updates
        emergencyContactTreeService.onEscalationUpdate((escalation) => {
          setEscalations((prev) => {
            const updated = prev.map((e) => (e.id === escalation.id ? escalation : e))
            if (!updated.find((e) => e.id === escalation.id)) {
              updated.unshift(escalation)
            }
            return updated.slice(0, 10) // Keep last 10
          })
        })

        // Load existing data
        const existingContacts = emergencyContactTreeService.getEmergencyContacts()
        const activeEscalations = emergencyContactTreeService.getActiveEscalations()
        setContacts(existingContacts)
        setEscalations(activeEscalations)
      }
    } catch (error) {
      console.error("Contact tree initialization error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddContact = async () => {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      alert("Please fill in name and phone number")
      return
    }

    setIsLoading(true)
    try {
      const result = await emergencyContactTreeService.addEmergencyContact({
        ...contactForm,
        isAvailable: true,
      })

      if (result.success) {
        // Reset form
        setContactForm({
          name: "",
          phone: "",
          email: "",
          relationship: "family",
          priority: 1,
          preferredContactMethod: "call",
          specialInstructions: "",
        })
        setShowAddContact(false)

        // Refresh contacts
        const updatedContacts = emergencyContactTreeService.getEmergencyContacts()
        setContacts(updatedContacts)
      } else {
        alert(`Failed to add contact: ${result.error}`)
      }
    } catch (error) {
      console.error("Add contact error:", error)
      alert("Error adding contact")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartEscalation = async (type: string, severity: EmergencyEscalation["severity"]) => {
    if (contacts.length === 0) {
      alert("Please add emergency contacts first")
      return
    }

    setIsLoading(true)
    try {
      const result = await emergencyContactTreeService.startEmergencyEscalation(
        "current-user-id",
        type,
        severity,
        `Emergency escalation test - ${type} (${severity} severity)`,
      )

      if (result.success) {
        // Refresh escalations
        const activeEscalations = emergencyContactTreeService.getActiveEscalations()
        setEscalations(activeEscalations)
      } else {
        alert(`Failed to start escalation: ${result.error}`)
      }
    } catch (error) {
      console.error("Start escalation error:", error)
      alert("Error starting escalation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStopEscalation = async (escalationId: string) => {
    const result = await emergencyContactTreeService.stopEscalation(escalationId)
    if (result.success) {
      const activeEscalations = emergencyContactTreeService.getActiveEscalations()
      setEscalations(activeEscalations)
    }
  }

  const getRelationshipIcon = (relationship: EmergencyContact["relationship"]) => {
    switch (relationship) {
      case "family":
        return <Heart className="h-4 w-4 text-red-500" />
      case "friend":
        return <User className="h-4 w-4 text-blue-500" />
      case "neighbor":
        return <Users className="h-4 w-4 text-green-500" />
      case "caregiver":
        return <Shield className="h-4 w-4 text-purple-500" />
      case "medical":
        return <Heart className="h-4 w-4 text-red-600" />
      case "authority":
        return <Shield className="h-4 w-4 text-gray-600" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getContactMethodIcon = (method: EmergencyContact["preferredContactMethod"]) => {
    switch (method) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "sms":
        return <MessageSquare className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: EmergencyEscalation["severity"]) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <Phone className="h-12 w-12 mx-auto mb-4 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Contact Tree</h1>
          <p className="text-gray-600">Automated emergency escalation and contact management system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls & Stats */}
          <div className="space-y-6">
            <Card className={isInitialized ? "border-green-200 bg-green-50" : "border-gray-200"}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    System Status
                  </div>
                  <Badge variant={isInitialized ? "default" : "secondary"}>
                    {isInitialized ? "Ready" : "Starting"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Emergency Contacts</span>
                    <span className="font-medium">{contacts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Escalations</span>
                    <span className="font-medium">{escalations.filter((e) => e.isActive).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Escalations</span>
                    <span className="font-medium">{escalations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Contacts</span>
                    <span className="font-medium">{contacts.filter((c) => c.isAvailable).length}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="w-full mt-4"
                  disabled={!isInitialized}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Emergency Contact
                </Button>
              </CardContent>
            </Card>

            {/* Add Contact Form */}
            {showAddContact && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        placeholder="+1234567890"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="relationship">Relationship</Label>
                      <Select
                        value={contactForm.relationship}
                        onValueChange={(value: any) => setContactForm({ ...contactForm, relationship: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="neighbor">Neighbor</SelectItem>
                          <SelectItem value="caregiver">Caregiver</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="authority">Authority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={contactForm.priority.toString()}
                        onValueChange={(value) => setContactForm({ ...contactForm, priority: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 (Highest)</SelectItem>
                          <SelectItem value="2">2 (High)</SelectItem>
                          <SelectItem value="3">3 (Medium)</SelectItem>
                          <SelectItem value="4">4 (Low)</SelectItem>
                          <SelectItem value="5">5 (Lowest)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                    <Select
                      value={contactForm.preferredContactMethod}
                      onValueChange={(value: any) => setContactForm({ ...contactForm, preferredContactMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="instructions">Special Instructions</Label>
                    <Input
                      id="instructions"
                      placeholder="Any special instructions for contacting this person"
                      value={contactForm.specialInstructions}
                      onChange={(e) => setContactForm({ ...contactForm, specialInstructions: e.target.value })}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleAddContact} disabled={isLoading} className="flex-1">
                      {isLoading ? "Adding..." : "Add Contact"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddContact(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Escalations */}
            <Card>
              <CardHeader>
                <CardTitle>Test Emergency Escalation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleStartEscalation("Medical Emergency", "critical")}
                    disabled={isLoading || !isInitialized || contacts.length === 0}
                    variant="destructive"
                    className="w-full"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Critical Medical
                  </Button>

                  <Button
                    onClick={() => handleStartEscalation("Fire Emergency", "high")}
                    disabled={isLoading || !isInitialized || contacts.length === 0}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    High Fire Alert
                  </Button>

                  <Button
                    onClick={() => handleStartEscalation("General Help", "medium")}
                    disabled={isLoading || !isInitialized || contacts.length === 0}
                    variant="outline"
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Medium Help Request
                  </Button>

                  <Button
                    onClick={() => handleStartEscalation("Check-in", "low")}
                    disabled={isLoading || !isInitialized || contacts.length === 0}
                    variant="outline"
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Low Check-in
                  </Button>
                </div>

                {contacts.length === 0 && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Add emergency contacts first to test escalation</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

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
                      <strong>Add Contacts:</strong> Set up emergency contacts with priority levels and preferred
                      contact methods
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Auto-Escalation:</strong> System automatically contacts people based on emergency severity
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Multi-Level:</strong> If no response, escalates to next priority level automatically
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Emergency Services:</strong> Final escalation contacts emergency services if needed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts.length === 0 ? (
                    <div className="text-center py-8">
                      <Phone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 mb-4">No emergency contacts added yet</p>
                      <Button onClick={() => setShowAddContact(true)} disabled={!isInitialized}>
                        Add First Contact
                      </Button>
                    </div>
                  ) : (
                    contacts
                      .sort((a, b) => a.priority - b.priority)
                      .map((contact) => (
                        <Card key={contact.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                {getRelationshipIcon(contact.relationship)}
                                <div>
                                  <h3 className="font-medium">{contact.name}</h3>
                                  <p className="text-sm text-gray-600 capitalize">{contact.relationship}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">Priority {contact.priority}</Badge>
                                <Badge variant={contact.isAvailable ? "default" : "secondary"}>
                                  {contact.isAvailable ? "Available" : "Unavailable"}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span>{contact.phone}</span>
                              </div>
                              {contact.email && (
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <span>{contact.email}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                {getContactMethodIcon(contact.preferredContactMethod)}
                                <span className="capitalize">Prefers {contact.preferredContactMethod}</span>
                              </div>
                            </div>

                            {contact.specialInstructions && (
                              <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                                <strong>Special Instructions:</strong> {contact.specialInstructions}
                              </div>
                            )}

                            {contact.lastContacted && (
                              <div className="mt-2 text-xs text-gray-500">
                                Last contacted: {contact.lastContacted.toLocaleString()}
                                {contact.responseTime && ` (responded in ${contact.responseTime} minutes)`}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Escalations */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Escalations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {escalations.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 mb-4">No escalations yet</p>
                      <p className="text-sm text-gray-400">Test the emergency escalation system above</p>
                    </div>
                  ) : (
                    escalations.map((escalation) => (
                      <Card
                        key={escalation.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${selectedEscalation?.id === escalation.id ? "ring-2 ring-blue-500" : ""
                          } ${escalation.isActive ? "border-l-4 border-l-red-500" : "border-l-4 border-l-gray-300"}`}
                        onClick={() => setSelectedEscalation(escalation)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {escalation.isActive ? (
                                <PlayCircle className="h-5 w-5 text-red-600" />
                              ) : (
                                <StopCircle className="h-5 w-5 text-gray-500" />
                              )}
                              <div>
                                <h3 className="font-medium">{escalation.emergencyType}</h3>
                                <p className="text-sm text-gray-600">
                                  Level {escalation.currentLevel} of {escalation.maxLevel}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(escalation.severity)}>{escalation.severity}</Badge>
                              <Badge variant={escalation.isActive ? "destructive" : "secondary"}>
                                {escalation.isActive ? "Active" : "Stopped"}
                              </Badge>
                            </div>
                          </div>

                          <div className="mb-3">
                            <Progress
                              value={(escalation.currentLevel / escalation.maxLevel) * 100}
                              className="h-2 mb-1"
                            />
                            <div className="text-xs text-gray-600">
                              Escalation Progress: {escalation.currentLevel}/{escalation.maxLevel}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Started:</span>
                              <div>{escalation.startTime.toLocaleTimeString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Successful:</span>
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span>{escalation.successfulContacts.length}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Failed:</span>
                              <div className="flex items-center space-x-1">
                                <XCircle className="h-3 w-3 text-red-600" />
                                <span>{escalation.failedContacts.length}</span>
                              </div>
                            </div>
                          </div>

                          {escalation.isActive && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStopEscalation(escalation.id)
                              }}
                              className="mt-3"
                            >
                              <StopCircle className="h-4 w-4 mr-1" />
                              Stop Escalation
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Escalation View */}
            {selectedEscalation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Escalation Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Escalation Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Emergency Type:</span>
                          <div className="font-medium">{selectedEscalation.emergencyType}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Severity:</span>
                          <div>
                            <Badge className={getSeverityColor(selectedEscalation.severity)}>
                              {selectedEscalation.severity}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Started:</span>
                          <div>{selectedEscalation.startTime.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <div>
                            <Badge variant={selectedEscalation.isActive ? "destructive" : "secondary"}>
                              {selectedEscalation.isActive ? "Active" : "Stopped"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Attempts */}
                    <div>
                      <h4 className="font-medium mb-3">Contact Attempts</h4>
                      <div className="space-y-2">
                        {selectedEscalation.contactAttempts.length === 0 ? (
                          <p className="text-gray-500 text-sm">No contact attempts yet</p>
                        ) : (
                          selectedEscalation.contactAttempts.map((attempt, index) => {
                            const contact = contacts.find((c) => c.id === attempt.contactId)
                            return (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {getContactMethodIcon(attempt.method)}
                                  <div>
                                    <div className="font-medium">{contact?.name || "Unknown Contact"}</div>
                                    <div className="text-sm text-gray-600 capitalize">{attempt.method}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">
                                    {attempt.timestamp.toLocaleTimeString()}
                                  </span>
                                  <Badge
                                    variant={
                                      attempt.status === "responded"
                                        ? "default"
                                        : attempt.status === "failed"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                  >
                                    {attempt.status}
                                  </Badge>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>

                    {/* Escalation Rules */}
                    <div>
                      <h4 className="font-medium mb-3">Escalation Levels</h4>
                      <div className="space-y-2">
                        {selectedEscalation.escalationRules.map((rule, index) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-lg ${rule.level === selectedEscalation.currentLevel
                                ? "border-blue-500 bg-blue-50"
                                : rule.level < selectedEscalation.currentLevel
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">Level {rule.level}</Badge>
                                <span className="text-sm">
                                  {rule.level === selectedEscalation.currentLevel
                                    ? "Current"
                                    : rule.level < selectedEscalation.currentLevel
                                      ? "Completed"
                                      : "Pending"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">Wait: {rule.waitTime} min</div>
                            </div>
                            <div className="text-sm">
                              <div className="mb-1">
                                <strong>Contacts:</strong> {rule.contactIds.length} people
                              </div>
                              <div className="mb-1">
                                <strong>Methods:</strong> {rule.methods.join(", ")}
                              </div>
                              <div>
                                <strong>Auto-escalate:</strong> {rule.autoEscalate ? "Yes" : "No"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
