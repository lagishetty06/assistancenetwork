interface CrowdsourceAlert {
  id: string
  type: "fire" | "medical" | "accident" | "weather" | "crime" | "infrastructure" | "other"
  title: string
  description: string
  location: {
    lat: number
    lng: number
    address: string
  }
  severity: "low" | "medium" | "high" | "critical"
  reportedBy: {
    userId?: string
    name: string
    phone?: string
    isVerified: boolean
  }
  timestamp: Date
  status: "pending" | "verified" | "resolved" | "false_alarm"
  verificationCount: number
  verifiedBy: string[]
  media?: {
    photos: string[]
    videos: string[]
    audio: string[]
  }
  affectedRadius: number // in meters
  estimatedDuration?: number // in minutes
  emergencyServices: {
    police: boolean
    fire: boolean
    medical: boolean
    contacted: boolean
  }
  updates: AlertUpdate[]
}

interface AlertUpdate {
  id: string
  message: string
  timestamp: Date
  updatedBy: string
  type: "status" | "info" | "resolution"
}

interface AlertSubscription {
  userId: string
  alertTypes: string[]
  location: {
    lat: number
    lng: number
    radius: number
  }
  notificationMethods: ("push" | "sms" | "email")[]
}

class CrowdsourceAlertsService {
  private alerts: Map<string, CrowdsourceAlert> = new Map()
  private subscriptions: Map<string, AlertSubscription> = new Map()
  private alertCallbacks: ((alert: CrowdsourceAlert) => void)[] = []
  private websocket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  // Initialize crowdsource alerts service
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      // Load existing alerts
      await this.loadExistingAlerts()

      // Set up real-time connection
      await this.setupWebSocket()

      // Load user subscriptions
      await this.loadUserSubscriptions()

      console.log("✅ Crowdsource alerts service initialized")
      return { success: true }
    } catch (error) {
      console.error("❌ Crowdsource alerts initialization failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Set up WebSocket connection for real-time alerts
  private async setupWebSocket() {
    try {
      // In a real app, this would connect to your WebSocket server
      const wsUrl = "wss://your-websocket-server.com/alerts"

      // For demo purposes, we'll simulate WebSocket functionality
      console.log("🔌 Setting up real-time alert connection...")

      // Simulate periodic alert updates
      this.simulateRealTimeAlerts()
    } catch (error) {
      console.error("❌ WebSocket setup failed:", error)
    }
  }

  // Simulate real-time alerts for demo
  private simulateRealTimeAlerts() {
    setInterval(() => {
      // Randomly generate demo alerts
      if (Math.random() < 0.1) {
        // 10% chance every interval
        this.generateDemoAlert()
      }
    }, 30000) // Every 30 seconds
  }

  // Generate demo alert for testing
  private generateDemoAlert() {
    const alertTypes = ["fire", "medical", "accident", "weather", "infrastructure"]
    const severities = ["low", "medium", "high", "critical"]
    const locations = [
      { lat: 40.7128, lng: -74.006, address: "New York, NY" },
      { lat: 34.0522, lng: -118.2437, address: "Los Angeles, CA" },
      { lat: 41.8781, lng: -87.6298, address: "Chicago, IL" },
    ]

    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)] as CrowdsourceAlert["type"]
    const severity = severities[Math.floor(Math.random() * severities.length)] as CrowdsourceAlert["severity"]
    const location = locations[Math.floor(Math.random() * locations.length)]

    const demoAlert: CrowdsourceAlert = {
      id: `demo-${Date.now()}`,
      type,
      title: this.generateAlertTitle(type),
      description: this.generateAlertDescription(type),
      location,
      severity,
      reportedBy: {
        name: "Community Member",
        isVerified: Math.random() > 0.5,
      },
      timestamp: new Date(),
      status: "pending",
      verificationCount: Math.floor(Math.random() * 5),
      verifiedBy: [],
      affectedRadius: Math.floor(Math.random() * 2000) + 500,
      emergencyServices: {
        police: type === "crime" || type === "accident",
        fire: type === "fire",
        medical: type === "medical",
        contacted: false,
      },
      updates: [],
    }

    this.processNewAlert(demoAlert)
  }

  // Generate alert title based on type
  private generateAlertTitle(type: string): string {
    const titles = {
      fire: "Fire Reported",
      medical: "Medical Emergency",
      accident: "Traffic Accident",
      weather: "Severe Weather",
      crime: "Security Incident",
      infrastructure: "Infrastructure Issue",
      other: "Community Alert",
    }
    return titles[type as keyof typeof titles] || "Community Alert"
  }

  // Generate alert description based on type
  private generateAlertDescription(type: string): string {
    const descriptions = {
      fire: "Smoke and flames visible. Fire department notified.",
      medical: "Medical assistance needed. Ambulance requested.",
      accident: "Vehicle accident blocking traffic. Police en route.",
      weather: "Severe weather conditions affecting the area.",
      crime: "Security incident reported. Authorities contacted.",
      infrastructure: "Infrastructure damage affecting local services.",
      other: "Community members should be aware of this situation.",
    }
    return descriptions[type as keyof typeof descriptions] || "Situation requires community attention."
  }

  // Submit new crowdsource alert
  async submitAlert(
    alertData: Partial<CrowdsourceAlert>,
  ): Promise<{ success: boolean; alertId?: string; error?: string }> {
    try {
      // Validate required fields
      if (!alertData.type || !alertData.title || !alertData.location) {
        return { success: false, error: "Missing required fields" }
      }

      // Get current location if not provided
      const location = alertData.location || (await this.getCurrentLocation())
      if (!location) {
        return { success: false, error: "Location is required" }
      }

      // Create new alert
      const newAlert: CrowdsourceAlert = {
        id: `alert-${Date.now()}`,
        type: alertData.type!,
        title: alertData.title!,
        description: alertData.description || "",
        location: location,
        severity: alertData.severity || "medium",
        reportedBy: {
          userId: alertData.reportedBy?.userId,
          name: alertData.reportedBy?.name || "Anonymous",
          phone: alertData.reportedBy?.phone,
          isVerified: alertData.reportedBy?.isVerified || false,
        },
        timestamp: new Date(),
        status: "pending",
        verificationCount: 0,
        verifiedBy: [],
        affectedRadius: alertData.affectedRadius || 1000,
        estimatedDuration: alertData.estimatedDuration,
        emergencyServices: alertData.emergencyServices || {
          police: false,
          fire: false,
          medical: false,
          contacted: false,
        },
        updates: [],
      }

      // Process the new alert
      await this.processNewAlert(newAlert)

      console.log(`✅ Alert submitted: ${newAlert.id}`)
      return { success: true, alertId: newAlert.id }
    } catch (error) {
      console.error("❌ Failed to submit alert:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Process new alert (validation, notification, storage)
  private async processNewAlert(alert: CrowdsourceAlert) {
    try {
      // Store alert
      this.alerts.set(alert.id, alert)

      // Check for duplicate alerts in the same area
      const nearbyAlerts = this.findNearbyAlerts(alert.location, 500, alert.type)
      if (nearbyAlerts.length > 0) {
        console.log(`⚠️ Similar alert found nearby: ${nearbyAlerts[0].id}`)
        // Could merge or flag as potential duplicate
      }

      // Auto-verify if reported by verified user
      if (alert.reportedBy.isVerified) {
        alert.verificationCount = 1
        alert.verifiedBy.push(alert.reportedBy.userId || alert.reportedBy.name)
      }

      // Determine if emergency services should be contacted
      if (alert.severity === "critical" || this.shouldContactEmergencyServices(alert)) {
        await this.contactEmergencyServices(alert)
      }

      // Notify subscribers
      await this.notifySubscribers(alert)

      // Notify callbacks
      this.alertCallbacks.forEach((callback) => callback(alert))

      // Save to persistent storage
      this.saveAlertsToStorage()

      console.log(`📢 Alert processed and distributed: ${alert.id}`)
    } catch (error) {
      console.error("❌ Failed to process alert:", error)
    }
  }

  // Find nearby alerts
  private findNearbyAlerts(location: { lat: number; lng: number }, radius: number, type?: string): CrowdsourceAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => {
      if (type && alert.type !== type) return false

      const distance = this.calculateDistance(location.lat, location.lng, alert.location.lat, alert.location.lng)

      return distance <= radius
    })
  }

  // Calculate distance between two points
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000 // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Determine if emergency services should be contacted
  private shouldContactEmergencyServices(alert: CrowdsourceAlert): boolean {
    const emergencyTypes = ["fire", "medical", "accident"]
    const criticalSeverity = alert.severity === "critical"
    const emergencyType = emergencyTypes.includes(alert.type)

    return criticalSeverity || emergencyType
  }

  // Contact emergency services
  private async contactEmergencyServices(alert: CrowdsourceAlert) {
    try {
      console.log(`🚨 Contacting emergency services for alert: ${alert.id}`)

      // In a real implementation, this would integrate with emergency services APIs
      const emergencyData = {
        alertId: alert.id,
        type: alert.type,
        location: alert.location,
        severity: alert.severity,
        description: alert.description,
        reportedBy: alert.reportedBy.name,
        timestamp: alert.timestamp,
      }

      // Mock emergency services contact
      console.log("📞 Emergency services contacted:", emergencyData)

      // Update alert status
      alert.emergencyServices.contacted = true
      alert.updates.push({
        id: `update-${Date.now()}`,
        message: "Emergency services have been notified",
        timestamp: new Date(),
        updatedBy: "System",
        type: "status",
      })
    } catch (error) {
      console.error("❌ Failed to contact emergency services:", error)
    }
  }

  // Notify subscribers about new alert
  private async notifySubscribers(alert: CrowdsourceAlert) {
    try {
      const relevantSubscriptions = Array.from(this.subscriptions.values()).filter((sub) => {
        // Check if alert type matches subscription
        if (!sub.alertTypes.includes(alert.type)) return false

        // Check if alert is within subscriber's radius
        const distance = this.calculateDistance(
          alert.location.lat,
          alert.location.lng,
          sub.location.lat,
          sub.location.lng,
        )

        return distance <= sub.location.radius
      })

      console.log(`📬 Notifying ${relevantSubscriptions.length} subscribers`)

      for (const subscription of relevantSubscriptions) {
        // Send notifications based on user preferences
        if (subscription.notificationMethods.includes("push")) {
          await this.sendPushNotification(subscription.userId, alert)
        }

        if (subscription.notificationMethods.includes("sms")) {
          await this.sendSMSNotification(subscription.userId, alert)
        }

        if (subscription.notificationMethods.includes("email")) {
          await this.sendEmailNotification(subscription.userId, alert)
        }
      }
    } catch (error) {
      console.error("❌ Failed to notify subscribers:", error)
    }
  }

  // Send push notification
  private async sendPushNotification(userId: string, alert: CrowdsourceAlert) {
    if ("Notification" in window && Notification.permission === "granted") {
      const title = `🚨 ${alert.title}`
      const body = `${alert.description} - ${alert.location.address}`

      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `alert-${alert.id}`,
        requireInteraction: alert.severity === "critical",
        data: { alertId: alert.id, type: alert.type },
      })
    }
  }

  // Send SMS notification
  private async sendSMSNotification(userId: string, alert: CrowdsourceAlert) {
    // Integration with SMS service
    console.log(`📱 SMS notification sent to user ${userId} for alert ${alert.id}`)
  }

  // Send email notification
  private async sendEmailNotification(userId: string, alert: CrowdsourceAlert) {
    // Integration with email service
    console.log(`📧 Email notification sent to user ${userId} for alert ${alert.id}`)
  }

  // Verify an alert
  async verifyAlert(alertId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const alert = this.alerts.get(alertId)
      if (!alert) {
        return { success: false, error: "Alert not found" }
      }

      // Check if user already verified this alert
      if (alert.verifiedBy.includes(userId)) {
        return { success: false, error: "Already verified by this user" }
      }

      // Add verification
      alert.verificationCount++
      alert.verifiedBy.push(userId)

      // Auto-verify if enough verifications
      if (alert.verificationCount >= 3 && alert.status === "pending") {
        alert.status = "verified"
        alert.updates.push({
          id: `update-${Date.now()}`,
          message: "Alert verified by community members",
          timestamp: new Date(),
          updatedBy: "System",
          type: "status",
        })
      }

      this.saveAlertsToStorage()
      console.log(`✅ Alert ${alertId} verified by user ${userId}`)

      return { success: true }
    } catch (error) {
      console.error("❌ Failed to verify alert:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Update alert status
  async updateAlert(alertId: string, update: AlertUpdate): Promise<{ success: boolean; error?: string }> {
    try {
      const alert = this.alerts.get(alertId)
      if (!alert) {
        return { success: false, error: "Alert not found" }
      }

      alert.updates.push(update)

      // Update status if it's a status update
      if (update.type === "status" && update.message.includes("resolved")) {
        alert.status = "resolved"
      }

      this.saveAlertsToStorage()

      // Notify subscribers of update
      this.alertCallbacks.forEach((callback) => callback(alert))

      return { success: true }
    } catch (error) {
      console.error("❌ Failed to update alert:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Subscribe to alerts
  async subscribeToAlerts(subscription: AlertSubscription): Promise<{ success: boolean; error?: string }> {
    try {
      this.subscriptions.set(subscription.userId, subscription)
      this.saveSubscriptionsToStorage()

      console.log(`✅ User ${subscription.userId} subscribed to alerts`)
      return { success: true }
    } catch (error) {
      console.error("❌ Failed to subscribe to alerts:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Get alerts for location
  getAlertsForLocation(lat: number, lng: number, radius = 5000): CrowdsourceAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => {
      const distance = this.calculateDistance(lat, lng, alert.location.lat, alert.location.lng)
      return distance <= radius && alert.status !== "resolved"
    })
  }

  // Get current location
  private getCurrentLocation(): Promise<{ lat: number; lng: number; address: string } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Current Location", // In real app, reverse geocode this
          })
        },
        (error) => {
          console.error("❌ Failed to get location:", error)
          resolve(null)
        },
        { timeout: 10000, maximumAge: 300000 },
      )
    })
  }

  // Load existing alerts from storage
  private async loadExistingAlerts() {
    try {
      const storedAlerts = localStorage.getItem("crowdsourceAlerts")
      if (storedAlerts) {
        const alertsData = JSON.parse(storedAlerts)
        alertsData.forEach((alertData: any) => {
          const alert: CrowdsourceAlert = {
            ...alertData,
            timestamp: new Date(alertData.timestamp),
            updates: alertData.updates.map((update: any) => ({
              ...update,
              timestamp: new Date(update.timestamp),
            })),
          }
          this.alerts.set(alert.id, alert)
        })
      }
      console.log(`📚 Loaded ${this.alerts.size} existing alerts`)
    } catch (error) {
      console.error("❌ Failed to load existing alerts:", error)
    }
  }

  // Load user subscriptions
  private async loadUserSubscriptions() {
    try {
      const storedSubscriptions = localStorage.getItem("alertSubscriptions")
      if (storedSubscriptions) {
        const subscriptionsData = JSON.parse(storedSubscriptions)
        subscriptionsData.forEach((sub: AlertSubscription) => {
          this.subscriptions.set(sub.userId, sub)
        })
      }
      console.log(`👥 Loaded ${this.subscriptions.size} alert subscriptions`)
    } catch (error) {
      console.error("❌ Failed to load subscriptions:", error)
    }
  }

  // Save alerts to storage
  private saveAlertsToStorage() {
    try {
      const alertsArray = Array.from(this.alerts.values())
      localStorage.setItem("crowdsourceAlerts", JSON.stringify(alertsArray))
    } catch (error) {
      console.error("❌ Failed to save alerts:", error)
    }
  }

  // Save subscriptions to storage
  private saveSubscriptionsToStorage() {
    try {
      const subscriptionsArray = Array.from(this.subscriptions.values())
      localStorage.setItem("alertSubscriptions", JSON.stringify(subscriptionsArray))
    } catch (error) {
      console.error("❌ Failed to save subscriptions:", error)
    }
  }

  // Register callback for new alerts
  onNewAlert(callback: (alert: CrowdsourceAlert) => void) {
    this.alertCallbacks.push(callback)
  }

  // Get all active alerts
  getActiveAlerts(): CrowdsourceAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => alert.status !== "resolved")
  }

  // Get alert by ID
  getAlert(alertId: string): CrowdsourceAlert | null {
    return this.alerts.get(alertId) || null
  }

  // Get alerts by type
  getAlertsByType(type: string): CrowdsourceAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => alert.type === type)
  }

  // Clean up old resolved alerts
  cleanupOldAlerts() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    for (const [id, alert] of this.alerts) {
      if (alert.status === "resolved" && alert.timestamp < oneWeekAgo) {
        this.alerts.delete(id)
      }
    }

    this.saveAlertsToStorage()
    console.log("🧹 Cleaned up old resolved alerts")
  }
}

export const crowdsourceAlertsService = new CrowdsourceAlertsService()
export type { CrowdsourceAlert, AlertUpdate, AlertSubscription }
