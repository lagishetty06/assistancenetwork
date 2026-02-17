interface EmergencyContact {
  id: string
  name: string
  phone: string
  email?: string
  relationship: "family" | "friend" | "neighbor" | "caregiver" | "medical" | "authority"
  priority: number // 1 = highest priority
  isAvailable: boolean
  lastContacted?: Date
  responseTime?: number // average response time in minutes
  preferredContactMethod: "call" | "sms" | "email"
  location?: {
    lat: number
    lng: number
    address: string
  }
  specialInstructions?: string
}

interface ContactAttempt {
  contactId: string
  method: "call" | "sms" | "email"
  timestamp: Date
  status: "pending" | "delivered" | "responded" | "failed" | "no_response"
  responseTime?: number
  message?: string
}

interface EmergencyEscalation {
  id: string
  userId: string
  emergencyType: string
  severity: "low" | "medium" | "high" | "critical"
  startTime: Date
  currentLevel: number
  maxLevel: number
  isActive: boolean
  contactAttempts: ContactAttempt[]
  successfulContacts: string[]
  failedContacts: string[]
  escalationRules: EscalationRule[]
}

interface EscalationRule {
  level: number
  waitTime: number // minutes to wait before escalating
  contactIds: string[]
  methods: ("call" | "sms" | "email")[]
  requireResponse: boolean
  autoEscalate: boolean
}

class EmergencyContactTreeService {
  private contacts: Map<string, EmergencyContact> = new Map()
  private activeEscalations: Map<string, EmergencyEscalation> = new Map()
  private escalationCallbacks: ((escalation: EmergencyEscalation) => void)[] = []

  // Initialize emergency contact tree service
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      // Load emergency contacts
      await this.loadEmergencyContacts()

      // Load active escalations
      await this.loadActiveEscalations()

      // Set up periodic checks
      this.startPeriodicChecks()

      console.log("✅ Emergency contact tree service initialized")
      return { success: true }
    } catch (error) {
      console.error("❌ Emergency contact tree initialization failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Add emergency contact
  async addEmergencyContact(
    contact: Omit<EmergencyContact, "id">,
  ): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      const newContact: EmergencyContact = {
        ...contact,
        id: `contact-${Date.now()}`,
        isAvailable: true,
      }

      this.contacts.set(newContact.id, newContact)
      await this.saveContactsToStorage()

      console.log(`✅ Emergency contact added: ${newContact.name}`)
      return { success: true, contactId: newContact.id }
    } catch (error) {
      console.error("❌ Failed to add emergency contact:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Start emergency escalation
  async startEmergencyEscalation(
    userId: string,
    emergencyType: string,
    severity: EmergencyEscalation["severity"],
    customMessage?: string,
  ): Promise<{ success: boolean; escalationId?: string; error?: string }> {
    try {
      // Get user's emergency contacts
      const userContacts = this.getUserContacts(userId)
      if (userContacts.length === 0) {
        return { success: false, error: "No emergency contacts configured" }
      }

      // Create escalation rules based on severity
      const escalationRules = this.createEscalationRules(userContacts, severity)

      // Create new escalation
      const escalation: EmergencyEscalation = {
        id: `escalation-${Date.now()}`,
        userId,
        emergencyType,
        severity,
        startTime: new Date(),
        currentLevel: 1,
        maxLevel: escalationRules.length,
        isActive: true,
        contactAttempts: [],
        successfulContacts: [],
        failedContacts: [],
        escalationRules,
      }

      this.activeEscalations.set(escalation.id, escalation)

      // Start contacting first level
      await this.executeEscalationLevel(escalation, customMessage)

      console.log(`🚨 Emergency escalation started: ${escalation.id}`)
      return { success: true, escalationId: escalation.id }
    } catch (error) {
      console.error("❌ Failed to start emergency escalation:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Create escalation rules based on severity
  private createEscalationRules(contacts: EmergencyContact[], severity: string): EscalationRule[] {
    const sortedContacts = contacts.sort((a, b) => a.priority - b.priority)
    const rules: EscalationRule[] = []

    switch (severity) {
      case "critical":
        // Level 1: Immediate family/caregivers (0 wait time)
        rules.push({
          level: 1,
          waitTime: 0,
          contactIds: sortedContacts
            .filter((c) => c.relationship === "family" || c.relationship === "caregiver")
            .slice(0, 3)
            .map((c) => c.id),
          methods: ["call", "sms"],
          requireResponse: true,
          autoEscalate: true,
        })

        // Level 2: All family + medical contacts (2 minutes)
        rules.push({
          level: 2,
          waitTime: 2,
          contactIds: sortedContacts
            .filter((c) => c.relationship === "family" || c.relationship === "medical")
            .map((c) => c.id),
          methods: ["call", "sms", "email"],
          requireResponse: true,
          autoEscalate: true,
        })

        // Level 3: All contacts + authorities (5 minutes)
        rules.push({
          level: 3,
          waitTime: 5,
          contactIds: sortedContacts.map((c) => c.id),
          methods: ["call", "sms", "email"],
          requireResponse: false,
          autoEscalate: false,
        })
        break

      case "high":
        // Level 1: Primary contacts (2 minutes)
        rules.push({
          level: 1,
          waitTime: 2,
          contactIds: sortedContacts.slice(0, 2).map((c) => c.id),
          methods: ["call", "sms"],
          requireResponse: true,
          autoEscalate: true,
        })

        // Level 2: Extended contacts (10 minutes)
        rules.push({
          level: 2,
          waitTime: 10,
          contactIds: sortedContacts.slice(0, 5).map((c) => c.id),
          methods: ["call", "sms", "email"],
          requireResponse: true,
          autoEscalate: true,
        })
        break

      case "medium":
        // Level 1: Primary contacts (5 minutes)
        rules.push({
          level: 1,
          waitTime: 5,
          contactIds: sortedContacts.slice(0, 2).map((c) => c.id),
          methods: ["sms", "call"],
          requireResponse: true,
          autoEscalate: true,
        })

        // Level 2: All contacts (30 minutes)
        rules.push({
          level: 2,
          waitTime: 30,
          contactIds: sortedContacts.map((c) => c.id),
          methods: ["sms", "email"],
          requireResponse: false,
          autoEscalate: false,
        })
        break

      default: // low
        // Level 1: All contacts (15 minutes)
        rules.push({
          level: 1,
          waitTime: 15,
          contactIds: sortedContacts.map((c) => c.id),
          methods: ["sms", "email"],
          requireResponse: false,
          autoEscalate: false,
        })
        break
    }

    return rules
  }

  // Execute escalation level
  private async executeEscalationLevel(escalation: EmergencyEscalation, customMessage?: string) {
    try {
      const currentRule = escalation.escalationRules.find((rule) => rule.level === escalation.currentLevel)
      if (!currentRule) return

      console.log(`📞 Executing escalation level ${escalation.currentLevel} for ${escalation.id}`)

      // Contact each person in this level
      for (const contactId of currentRule.contactIds) {
        const contact = this.contacts.get(contactId)
        if (!contact || !contact.isAvailable) continue

        // Try each contact method
        for (const method of currentRule.methods) {
          const attempt = await this.attemptContact(contact, method, escalation, customMessage)
          escalation.contactAttempts.push(attempt)
        }
      }

      // Schedule escalation check
      if (currentRule.autoEscalate && escalation.currentLevel < escalation.maxLevel) {
        setTimeout(
          () => {
            this.checkEscalationProgress(escalation.id)
          },
          currentRule.waitTime * 60 * 1000,
        ) // Convert minutes to milliseconds
      }

      // Notify callbacks
      this.escalationCallbacks.forEach((callback) => callback(escalation))
    } catch (error) {
      console.error("❌ Failed to execute escalation level:", error)
    }
  }

  // Attempt to contact a person
  private async attemptContact(
    contact: EmergencyContact,
    method: "call" | "sms" | "email",
    escalation: EmergencyEscalation,
    customMessage?: string,
  ): Promise<ContactAttempt> {
    const attempt: ContactAttempt = {
      contactId: contact.id,
      method,
      timestamp: new Date(),
      status: "pending",
    }

    try {
      const message = customMessage || this.generateEmergencyMessage(escalation, contact)

      switch (method) {
        case "call":
          await this.makePhoneCall(contact.phone, message)
          break
        case "sms":
          await this.sendSMS(contact.phone, message)
          break
        case "email":
          if (contact.email) {
            await this.sendEmail(contact.email, message)
          }
          break
      }

      attempt.status = "delivered"
      console.log(`✅ Contact attempt successful: ${contact.name} via ${method}`)
    } catch (error) {
      attempt.status = "failed"
      console.error(`❌ Contact attempt failed: ${contact.name} via ${method}`, error)
    }

    return attempt
  }

  // Generate emergency message
  private generateEmergencyMessage(escalation: EmergencyEscalation, contact: EmergencyContact): string {
    const urgencyText =
      escalation.severity === "critical"
        ? "CRITICAL EMERGENCY"
        : escalation.severity === "high"
          ? "URGENT"
          : "EMERGENCY"

    const baseMessage = `🚨 ${urgencyText}: ${escalation.emergencyType} assistance needed. `
    const contactInfo = `Please respond immediately or call emergency services. `
    const timestamp = `Time: ${escalation.startTime.toLocaleString()}. `
    const signature = `- Alert & Assistance Network`

    let personalizedMessage = baseMessage

    if (contact.specialInstructions) {
      personalizedMessage += `Special instructions: ${contact.specialInstructions}. `
    }

    return personalizedMessage + contactInfo + timestamp + signature
  }

  // Make phone call (integration with calling service)
  private async makePhoneCall(phoneNumber: string, message: string): Promise<void> {
    // In a real implementation, this would integrate with a calling service
    console.log(`📞 Calling ${phoneNumber}: ${message}`)

    // Simulate call attempt
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 1000)
    })
  }

  // Send SMS
  private async sendSMS(phoneNumber: string, message: string): Promise<void> {
    // Integration with SMS service
    console.log(`📱 SMS to ${phoneNumber}: ${message}`)

    // Simulate SMS sending
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  }

  // Send email
  private async sendEmail(email: string, message: string): Promise<void> {
    // Integration with email service
    console.log(`📧 Email to ${email}: ${message}`)

    // Simulate email sending
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 1000)
    })
  }

  // Check escalation progress
  private async checkEscalationProgress(escalationId: string) {
    const escalation = this.activeEscalations.get(escalationId)
    if (!escalation || !escalation.isActive) return

    const currentRule = escalation.escalationRules.find((rule) => rule.level === escalation.currentLevel)
    if (!currentRule) return

    // Check if we have successful responses
    const hasResponse = escalation.successfulContacts.length > 0

    if (!hasResponse && currentRule.requireResponse && escalation.currentLevel < escalation.maxLevel) {
      // Escalate to next level
      escalation.currentLevel++
      console.log(`⬆️ Escalating to level ${escalation.currentLevel} for ${escalationId}`)
      await this.executeEscalationLevel(escalation)
    } else if (!hasResponse && escalation.currentLevel >= escalation.maxLevel) {
      // Maximum escalation reached
      console.log(`🔴 Maximum escalation reached for ${escalationId}`)
      await this.handleMaxEscalation(escalation)
    }
  }

  // Handle maximum escalation
  private async handleMaxEscalation(escalation: EmergencyEscalation) {
    console.log(`🚨 Maximum escalation reached - contacting emergency services`)

    // Contact emergency services as last resort
    const emergencyMessage = `AUTOMATED EMERGENCY ALERT: ${escalation.emergencyType} - No response from emergency contacts. User ID: ${escalation.userId}. Started: ${escalation.startTime.toISOString()}`

    // In a real implementation, this would contact emergency services
    console.log("🚑 Emergency services contacted:", emergencyMessage)

    escalation.isActive = false
  }

  // Record contact response
  async recordContactResponse(
    escalationId: string,
    contactId: string,
    responseTime: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const escalation = this.activeEscalations.get(escalationId)
      if (!escalation) {
        return { success: false, error: "Escalation not found" }
      }

      // Add to successful contacts
      if (!escalation.successfulContacts.includes(contactId)) {
        escalation.successfulContacts.push(contactId)
      }

      // Update contact response time
      const contact = this.contacts.get(contactId)
      if (contact) {
        contact.responseTime = responseTime
        contact.lastContacted = new Date()
      }

      // Update contact attempts
      const attempts = escalation.contactAttempts.filter((a) => a.contactId === contactId)
      attempts.forEach((attempt) => {
        if (attempt.status === "delivered") {
          attempt.status = "responded"
          attempt.responseTime = responseTime
        }
      })

      // Check if escalation can be stopped
      if (escalation.successfulContacts.length > 0) {
        escalation.isActive = false
        console.log(`✅ Escalation resolved: ${escalationId}`)
      }

      await this.saveEscalationsToStorage()
      return { success: true }
    } catch (error) {
      console.error("❌ Failed to record contact response:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Get user contacts
  private getUserContacts(userId: string): EmergencyContact[] {
    // In a real implementation, this would filter by userId
    return Array.from(this.contacts.values())
  }

  // Start periodic checks
  private startPeriodicChecks() {
    setInterval(() => {
      this.checkActiveEscalations()
    }, 60000) // Check every minute
  }

  // Check all active escalations
  private checkActiveEscalations() {
    for (const escalation of this.activeEscalations.values()) {
      if (escalation.isActive) {
        this.checkEscalationProgress(escalation.id)
      }
    }
  }

  // Load emergency contacts from storage
  private async loadEmergencyContacts() {
    try {
      const storedContacts = localStorage.getItem("emergencyContacts")
      if (storedContacts) {
        const contactsData = JSON.parse(storedContacts)
        contactsData.forEach((contactData: any) => {
          const contact: EmergencyContact = {
            ...contactData,
            lastContacted: contactData.lastContacted ? new Date(contactData.lastContacted) : undefined,
          }
          this.contacts.set(contact.id, contact)
        })
      }
      console.log(`👥 Loaded ${this.contacts.size} emergency contacts`)
    } catch (error) {
      console.error("❌ Failed to load emergency contacts:", error)
    }
  }

  // Load active escalations
  private async loadActiveEscalations() {
    try {
      const storedEscalations = localStorage.getItem("activeEscalations")
      if (storedEscalations) {
        const escalationsData = JSON.parse(storedEscalations)
        escalationsData.forEach((escalationData: any) => {
          const escalation: EmergencyEscalation = {
            ...escalationData,
            startTime: new Date(escalationData.startTime),
            contactAttempts: escalationData.contactAttempts.map((attempt: any) => ({
              ...attempt,
              timestamp: new Date(attempt.timestamp),
            })),
          }
          this.activeEscalations.set(escalation.id, escalation)
        })
      }
      console.log(`🚨 Loaded ${this.activeEscalations.size} active escalations`)
    } catch (error) {
      console.error("❌ Failed to load active escalations:", error)
    }
  }

  // Save contacts to storage
  private async saveContactsToStorage() {
    try {
      const contactsArray = Array.from(this.contacts.values())
      localStorage.setItem("emergencyContacts", JSON.stringify(contactsArray))
    } catch (error) {
      console.error("❌ Failed to save contacts:", error)
    }
  }

  // Save escalations to storage
  private async saveEscalationsToStorage() {
    try {
      const escalationsArray = Array.from(this.activeEscalations.values())
      localStorage.setItem("activeEscalations", JSON.stringify(escalationsArray))
    } catch (error) {
      console.error("❌ Failed to save escalations:", error)
    }
  }

  // Register callback for escalation updates
  onEscalationUpdate(callback: (escalation: EmergencyEscalation) => void) {
    this.escalationCallbacks.push(callback)
  }

  // Get emergency contacts
  getEmergencyContacts(): EmergencyContact[] {
    return Array.from(this.contacts.values())
  }

  // Get active escalations
  getActiveEscalations(): EmergencyEscalation[] {
    return Array.from(this.activeEscalations.values()).filter((e) => e.isActive)
  }

  // Stop escalation
  async stopEscalation(escalationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const escalation = this.activeEscalations.get(escalationId)
      if (!escalation) {
        return { success: false, error: "Escalation not found" }
      }

      escalation.isActive = false
      await this.saveEscalationsToStorage()

      console.log(`⏹️ Escalation stopped: ${escalationId}`)
      return { success: true }
    } catch (error) {
      console.error("❌ Failed to stop escalation:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }
}

export const emergencyContactTreeService = new EmergencyContactTreeService()
export type { EmergencyContact, ContactAttempt, EmergencyEscalation, EscalationRule }
