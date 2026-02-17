interface SMSAlert {
  id: string
  phoneNumber: string
  message: string
  type: "emergency" | "weather" | "community" | "health"
  priority: "low" | "medium" | "high" | "critical"
  timestamp: Date
  status: "pending" | "sent" | "delivered" | "failed"
  retryCount: number
  location?: string
}

interface OfflineRequest {
  id: string
  type: "help_request" | "volunteer_signup" | "alert_report"
  data: any
  timestamp: Date
  phoneNumber?: string
  isUrgent: boolean
  location?: string
}

interface SMSServiceConfig {
  maxRetries: number
  retryDelay: number
  syncInterval: number
  emergencyNumbers: string[]
  volunteerNumbers: string[]
}

class OfflineSMSService {
  private smsQueue: SMSAlert[] = []
  private offlineRequests: OfflineRequest[] = []
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true
  private isInitialized = false
  private syncInterval: NodeJS.Timeout | null = null

  private config: SMSServiceConfig = {
    maxRetries: 3,
    retryDelay: 30000, // 30 seconds
    syncInterval: 60000, // 1 minute
    emergencyNumbers: ["+1234567890"], // Local emergency coordinator
    volunteerNumbers: ["+1234567891", "+1234567892"], // Mock volunteer numbers
  }

  // Initialize offline SMS service
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🚀 Initializing Offline SMS Service...")

      // Load queued messages from localStorage
      this.loadQueuedMessages()

      // Set up online/offline event listeners
      this.setupNetworkListeners()

      // Start periodic sync attempts
      this.startPeriodicSync()

      // Test SMS capability
      const testResult = await this.testSMSCapability()

      this.isInitialized = true

      console.log("✅ Offline SMS service initialized successfully")
      console.log(`📱 Loaded ${this.smsQueue.length} queued SMS and ${this.offlineRequests.length} offline requests`)

      return {
        success: true,
        ...testResult,
      }
    } catch (error) {
      console.error("❌ Offline SMS service initialization failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown initialization error",
      }
    }
  }

  // Test SMS sending capability
  private async testSMSCapability(): Promise<{ smsAvailable: boolean; fallbackMode: boolean }> {
    try {
      // Test if we can reach SMS API
      const response = await fetch("/api/sms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      })

      if (response.ok) {
        console.log("✅ SMS API available")
        return { smsAvailable: true, fallbackMode: false }
      } else {
        console.warn("⚠️ SMS API unavailable, using fallback mode")
        return { smsAvailable: false, fallbackMode: true }
      }
    } catch (error) {
      console.warn("⚠️ SMS test failed, using fallback mode:", error)
      return { smsAvailable: false, fallbackMode: true }
    }
  }

  // Set up network status listeners
  private setupNetworkListeners() {
    window.addEventListener("online", () => {
      console.log("📶 Network connection restored - syncing queued messages")
      this.isOnline = true
      this.syncQueuedMessages()
    })

    window.addEventListener("offline", () => {
      console.log("📵 Network connection lost - switching to offline mode")
      this.isOnline = false
    })

    // Update initial status
    if (typeof navigator !== "undefined") {
      this.isOnline = navigator.onLine
    }
  }

  // Load queued messages from localStorage
  private loadQueuedMessages() {
    try {
      const queuedSMS = localStorage.getItem("smsQueue")
      const queuedRequests = localStorage.getItem("offlineRequests")

      if (queuedSMS) {
        this.smsQueue = JSON.parse(queuedSMS).map((sms: any) => ({
          ...sms,
          timestamp: new Date(sms.timestamp),
        }))
      }

      if (queuedRequests) {
        this.offlineRequests = JSON.parse(queuedRequests).map((req: any) => ({
          ...req,
          timestamp: new Date(req.timestamp),
        }))
      }
    } catch (error) {
      console.error("❌ Failed to load queued messages:", error)
      // Reset corrupted data
      this.smsQueue = []
      this.offlineRequests = []
    }
  }

  // Save messages to localStorage
  private saveQueuedMessages() {
    try {
      localStorage.setItem("smsQueue", JSON.stringify(this.smsQueue))
      localStorage.setItem("offlineRequests", JSON.stringify(this.offlineRequests))
    } catch (error) {
      console.error("❌ Failed to save queued messages:", error)
    }
  }

  // Send emergency SMS alert
  async sendEmergencyAlert(
    phoneNumber: string,
    location?: string,
    message?: string,
  ): Promise<{ success: boolean; error?: string; queued?: boolean }> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const emergencyMessage = `🚨 EMERGENCY ALERT: ${message || "Help needed immediately"}${location ? ` Location: ${location}` : ""
      }. This is an automated message from Alert & Assistance Network. Reply STOP to unsubscribe.`

    const smsAlert: SMSAlert = {
      id: `emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber,
      message: emergencyMessage,
      type: "emergency",
      priority: "critical",
      timestamp: new Date(),
      status: "pending",
      retryCount: 0,
      location,
    }

    return this.queueSMS(smsAlert)
  }

  // Send weather alert SMS to multiple recipients
  async sendWeatherAlert(
    phoneNumbers: string[],
    weatherData: {
      type: string
      description: string
      severity: string
      location?: string
    },
  ): Promise<{ success: boolean; sent: number; failed: number; queued: number }> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const message = `⛈️ WEATHER ALERT: ${weatherData.type} (${weatherData.severity}) expected${weatherData.location ? ` in ${weatherData.location}` : ""
      }. ${weatherData.description}. Stay safe! - AAN`

    let sent = 0
    let failed = 0
    let queued = 0

    for (const phoneNumber of phoneNumbers) {
      const smsAlert: SMSAlert = {
        id: `weather-${Date.now()}-${phoneNumber.replace(/\D/g, "")}`,
        phoneNumber,
        message,
        type: "weather",
        priority: weatherData.severity === "severe" ? "high" : "medium",
        timestamp: new Date(),
        status: "pending",
        retryCount: 0,
        location: weatherData.location,
      }

      const result = await this.queueSMS(smsAlert)
      if (result.success) {
        if (result.queued) queued++
        else sent++
      } else {
        failed++
      }
    }

    return { success: true, sent, failed, queued }
  }

  // Send help request via SMS (when offline)
  async sendHelpRequestSMS(helpRequestData: any): Promise<{
    success: boolean
    error?: string
    sentTo: number
    queued: boolean
  }> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Create SMS message from help request
      const message = `🆘 HELP REQUEST: ${helpRequestData.type} - ${helpRequestData.description}. 
Contact: ${helpRequestData.contact}. 
Location: ${helpRequestData.address}, ${helpRequestData.city}. 
Urgency: ${helpRequestData.urgency}. 
Time: ${new Date().toLocaleString()}
- Alert & Assistance Network`

      // Get recipients based on location and urgency
      const recipients = this.getRecipientsForHelpRequest(helpRequestData)

      let successCount = 0

      for (const phoneNumber of recipients) {
        const smsAlert: SMSAlert = {
          id: `help-${Date.now()}-${phoneNumber.replace(/\D/g, "")}`,
          phoneNumber,
          message,
          type: "emergency",
          priority: helpRequestData.urgency === "critical" ? "critical" : "high",
          timestamp: new Date(),
          status: "pending",
          retryCount: 0,
          location: `${helpRequestData.city}, ${helpRequestData.state}`,
        }

        const result = await this.queueSMS(smsAlert)
        if (result.success) successCount++
      }

      // Also store as offline request for later sync
      const offlineRequest: OfflineRequest = {
        id: `offline-help-${Date.now()}`,
        type: "help_request",
        data: helpRequestData,
        timestamp: new Date(),
        phoneNumber: helpRequestData.contact,
        isUrgent: helpRequestData.urgency === "critical",
        location: `${helpRequestData.city}, ${helpRequestData.state}`,
      }

      this.offlineRequests.push(offlineRequest)
      this.saveQueuedMessages()

      return {
        success: successCount > 0,
        sentTo: successCount,
        queued: !this.isOnline,
      }
    } catch (error) {
      console.error("❌ Failed to send help request SMS:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        sentTo: 0,
        queued: false,
      }
    }
  }

  // Get recipients for help request based on location and urgency
  private getRecipientsForHelpRequest(helpRequestData: any): string[] {
    const recipients = [...this.config.emergencyNumbers]

    // Add volunteers based on location proximity (mock implementation)
    if (helpRequestData.urgency === "critical") {
      recipients.push(...this.config.volunteerNumbers)
    } else {
      // Add only nearby volunteers for non-critical requests
      recipients.push(this.config.volunteerNumbers[0])
    }

    return recipients
  }

  // Queue SMS for sending
  private async queueSMS(smsAlert: SMSAlert): Promise<{
    success: boolean
    error?: string
    queued?: boolean
  }> {
    try {
      this.smsQueue.push(smsAlert)
      this.saveQueuedMessages()

      // Try to send immediately if online
      if (this.isOnline) {
        const sent = await this.processSingleSMS(smsAlert)
        return { success: true, queued: !sent }
      } else {
        console.log("📵 Offline - SMS queued for later delivery")
        return { success: true, queued: true }
      }
    } catch (error) {
      console.error("❌ Failed to queue SMS:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Process single SMS
  private async processSingleSMS(sms: SMSAlert): Promise<boolean> {
    try {
      const result = await this.sendSMSMessage(sms)

      if (result.success) {
        sms.status = "sent"
        console.log(`✅ SMS sent to ${sms.phoneNumber}`)
        this.saveQueuedMessages()
        return true
      } else {
        sms.retryCount++
        if (sms.retryCount >= this.config.maxRetries) {
          sms.status = "failed"
          console.error(`❌ SMS failed permanently to ${sms.phoneNumber}`)
        } else {
          console.log(`⚠️ SMS retry ${sms.retryCount} for ${sms.phoneNumber}`)
        }
        this.saveQueuedMessages()
        return false
      }
    } catch (error) {
      console.error(`❌ Error sending SMS to ${sms.phoneNumber}:`, error)
      sms.retryCount++
      if (sms.retryCount >= this.config.maxRetries) {
        sms.status = "failed"
      }
      this.saveQueuedMessages()
      return false
    }
  }

  // Process SMS queue
  private async processSMSQueue() {
    const pendingSMS = this.smsQueue.filter((sms) => sms.status === "pending")

    console.log(`📱 Processing ${pendingSMS.length} pending SMS messages`)

    for (const sms of pendingSMS) {
      await this.processSingleSMS(sms)

      // Add delay between messages to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  // Send individual SMS message
  private async sendSMSMessage(sms: SMSAlert): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📤 Sending SMS to ${sms.phoneNumber}: ${sms.message.substring(0, 50)}...`)

      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: sms.phoneNumber,
          message: sms.message,
          priority: sms.priority,
          type: sms.type,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ SMS API response:`, result)
        return { success: true }
      } else {
        const error = await response.text()
        console.error(`❌ SMS API error:`, error)
        return { success: false, error }
      }
    } catch (error) {
      // Fallback: Log SMS for manual processing
      console.log(`📱 [FALLBACK] SMS to ${sms.phoneNumber}: ${sms.message}`)

      // In demo mode, consider it successful
      if (process.env.NODE_ENV === "development") {
        return { success: true }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // Start periodic sync attempts
  private startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && (this.smsQueue.length > 0 || this.offlineRequests.length > 0)) {
        console.log("🔄 Periodic sync triggered")
        this.syncQueuedMessages()
      }
    }, this.config.syncInterval)
  }

  // Sync queued messages when back online
  private async syncQueuedMessages() {
    if (!this.isOnline) return

    console.log("🔄 Syncing queued messages...")

    // Process SMS queue
    await this.processSMSQueue()

    // Process offline requests
    await this.processOfflineRequests()

    // Clean up completed messages
    this.cleanupCompletedMessages()
  }

  // Process offline requests
  private async processOfflineRequests() {
    const pendingRequests = [...this.offlineRequests]

    console.log(`📋 Processing ${pendingRequests.length} offline requests`)

    for (const request of pendingRequests) {
      try {
        // Submit to main system
        const response = await fetch("/api/help-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...request.data,
            isOfflineSync: true,
            originalTimestamp: request.timestamp,
          }),
        })

        if (response.ok) {
          // Remove from offline queue
          this.offlineRequests = this.offlineRequests.filter((r) => r.id !== request.id)
          console.log(`✅ Offline request ${request.id} synced successfully`)
        } else {
          console.error(`❌ Failed to sync offline request ${request.id}`)
        }
      } catch (error) {
        console.error(`❌ Failed to sync offline request ${request.id}:`, error)
      }
    }

    this.saveQueuedMessages()
  }

  // Clean up completed messages
  private cleanupCompletedMessages() {
    const beforeCount = this.smsQueue.length

    // Remove sent and permanently failed messages older than 24 hours
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000)

    this.smsQueue = this.smsQueue.filter((sms) => {
      if (sms.status === "pending") return true
      if (sms.timestamp > cutoffTime) return true
      return false
    })

    const afterCount = this.smsQueue.length

    if (beforeCount !== afterCount) {
      console.log(`🧹 Cleaned up ${beforeCount - afterCount} old SMS messages`)
      this.saveQueuedMessages()
    }
  }

  // Get queue status
  getQueueStatus(): {
    smsQueue: number
    offlineRequests: number
    isOnline: boolean
    isInitialized: boolean
    stats: {
      pending: number
      sent: number
      failed: number
    }
  } {
    const stats = {
      pending: this.smsQueue.filter((sms) => sms.status === "pending").length,
      sent: this.smsQueue.filter((sms) => sms.status === "sent").length,
      failed: this.smsQueue.filter((sms) => sms.status === "failed").length,
    }

    return {
      smsQueue: this.smsQueue.length,
      offlineRequests: this.offlineRequests.length,
      isOnline: this.isOnline,
      isInitialized: this.isInitialized,
      stats,
    }
  }

  // Send test SMS
  async sendTestSMS(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const testMessage =
      "📱 Test message from Alert & Assistance Network. Your SMS alerts are working correctly! Reply STOP to unsubscribe."

    const smsAlert: SMSAlert = {
      id: `test-${Date.now()}`,
      phoneNumber,
      message: testMessage,
      type: "community",
      priority: "low",
      timestamp: new Date(),
      status: "pending",
      retryCount: 0,
    }

    return this.queueSMS(smsAlert)
  }

  // Update configuration
  updateConfig(newConfig: Partial<SMSServiceConfig>) {
    this.config = { ...this.config, ...newConfig }
    console.log("⚙️ SMS service configuration updated:", this.config)
  }

  // Destroy service
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }

    window.removeEventListener("online", this.syncQueuedMessages)
    window.removeEventListener("offline", this.syncQueuedMessages)

    this.isInitialized = false
    console.log("🔄 Offline SMS service destroyed")
  }
}

export const offlineSMSService = new OfflineSMSService()
export type { SMSAlert, OfflineRequest, SMSServiceConfig }
