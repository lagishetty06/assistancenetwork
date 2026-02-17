interface GeoFence {
  id: string
  name: string
  type: "danger" | "safe" | "evacuation" | "medical" | "shelter"
  coordinates: {
    lat: number
    lng: number
  }
  radius: number // in meters
  isActive: boolean
  severity: "low" | "medium" | "high" | "critical"
  alertMessage: string
  createdAt: Date
  lastTriggered?: Date
}

interface LocationData {
  lat: number
  lng: number
  timestamp: Date
  accuracy?: number
}

interface GeoFenceAlert {
  fenceId: string
  action: "entered" | "exited"
  timestamp: Date
  location: {
    lat: number
    lng: number
  }
}

class GeoFencingService {
  private fences: Map<string, GeoFence> = new Map()
  private watchId: number | null = null
  private currentLocation: { lat: number; lng: number } | null = null
  private alertCallbacks: ((fence: GeoFence, action: "entered" | "exited") => void)[] = []
  private isWatching = false
  private retryCount = 0
  private maxRetries = 3
  private retryTimeout: NodeJS.Timeout | null = null

  // Initialize geo-fencing service
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        return { success: false, error: "Geolocation is not supported by this browser" }
      }

      // Load existing fences
      await this.loadGeoFences()

      // Request location permission and start watching
      const locationResult = await this.requestLocationPermission()
      if (!locationResult.success) {
        return locationResult
      }

      // Start location monitoring with retry logic
      await this.startLocationWatching()

      // Add default danger zones
      await this.addDefaultDangerZones()

      console.log("✅ Geo-fencing service initialized successfully")
      return { success: true }
    } catch (error) {
      console.error("❌ Geo-fencing initialization failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  /**
   * Attempt to obtain a position up to `maxAttempts` times with an
   * exponentially - increasing timeout. Returns `null` if every
   * attempt fails (e.g. TIMEOUT).
   */
  private async getPositionWithRetries(maxAttempts = 3, initialTimeout = 10000): Promise<GeolocationPosition | null> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const timeout = initialTimeout * attempt // 10 s, 20 s, 30 s …
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, {
            enableHighAccuracy: attempt === maxAttempts, // use high accuracy on last try
            timeout,
            maximumAge: 0,
          }),
        )
        return pos
      } catch (err: any) {
        if (err.code !== err.TIMEOUT) {
          // Non-timeout error – break early
          throw err
        }
        console.warn(`📡 getCurrentPosition timed out (${attempt}/${maxAttempts}) – retrying…`)
      }
    }
    return null
  }

  // Request location permission with retries
  private async requestLocationPermission(): Promise<{
    success: boolean
    error?: string
  }> {
    // Ask the user up-front; browsers like Chrome need an explicit call
    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      } as PermissionDescriptor)

      if (permission.state === "denied") {
        return { success: false, error: "Location permission denied by user" }
      }
    } catch {
      /* permissions API unsupported – continue */
    }

    try {
      const position = await this.getPositionWithRetries(3, 10000)

      if (!position) {
        return {
          success: false,
          error: "Unable to acquire a location fix after several attempts. Please ensure GPS is enabled and try again.",
        }
      }

      this.currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      console.log("✅ Initial location obtained")
      return { success: true }
    } catch (error: any) {
      const message = error?.message || "Unknown error while requesting location"
      console.error("❌ Location permission error:", message)
      return { success: false, error: message }
    }
  }

  // Start location watching with retry logic
  private async startLocationWatching(): Promise<void> {
    if (this.isWatching) {
      return
    }

    try {
      this.isWatching = true
      this.retryCount = 0

      const watchOptions = {
        enableHighAccuracy: true,
        timeout: 30000, // Increased timeout to 30 seconds
        maximumAge: 60000, // 1 minute
      }

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          // Success callback
          this.retryCount = 0 // Reset retry count on success
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          // Check if location has changed significantly
          if (this.hasLocationChanged(newLocation)) {
            this.currentLocation = newLocation
            this.checkGeoFences(newLocation)
          }

          console.log("📍 Location updated:", newLocation)
        },
        (error) => {
          // Error callback with retry logic
          console.warn(`⚠️ Location watch error (attempt ${this.retryCount + 1}):`, error.message)

          if (this.retryCount < this.maxRetries) {
            this.retryCount++
            console.log(`🔄 Retrying location watch in 5 seconds... (${this.retryCount}/${this.maxRetries})`)

            // Clear current watch
            if (this.watchId !== null) {
              navigator.geolocation.clearWatch(this.watchId)
              this.watchId = null
            }

            // Retry after delay
            this.retryTimeout = setTimeout(() => {
              this.startLocationWatching()
            }, 5000)
          } else {
            console.error("❌ Max retries reached for location watching")
            this.isWatching = false

            // Try fallback to getCurrentPosition
            this.fallbackToCurrentPosition()
          }
        },
        watchOptions,
      )

      console.log("👀 Started location watching")
    } catch (error) {
      console.error("❌ Failed to start location watching:", error)
      this.isWatching = false
    }
  }

  // Fallback to periodic getCurrentPosition calls
  private fallbackToCurrentPosition(): void {
    console.log("🔄 Falling back to periodic location checks")

    const checkLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          if (this.hasLocationChanged(newLocation)) {
            this.currentLocation = newLocation
            this.checkGeoFences(newLocation)
          }
        },
        (error) => {
          console.warn("⚠️ Fallback location check failed:", error.message)
        },
        {
          enableHighAccuracy: false, // Use less accurate but faster method
          timeout: 10000,
          maximumAge: 120000, // 2 minutes
        },
      )
    }

    // Check location every 2 minutes as fallback
    setInterval(checkLocation, 120000)
    checkLocation() // Initial check
  }

  // Check if location has changed significantly
  private hasLocationChanged(newLocation: { lat: number; lng: number }): boolean {
    if (!this.currentLocation) return true

    const distance = this.calculateDistance(
      this.currentLocation.lat,
      this.currentLocation.lng,
      newLocation.lat,
      newLocation.lng,
    )

    // Consider significant if moved more than 10 meters
    return distance > 10
  }

  // Check geo-fences for current location
  private checkGeoFences(location: { lat: number; lng: number }): void {
    for (const fence of this.fences.values()) {
      if (!fence.isActive) continue

      const distance = this.calculateDistance(location.lat, location.lng, fence.coordinates.lat, fence.coordinates.lng)
      const isInside = distance <= fence.radius

      // Check if status changed (entered or exited)
      const wasInside = this.wasInsideFence(fence.id)

      if (isInside && !wasInside) {
        // Entered fence
        this.triggerFenceAlert(fence, "entered")
      } else if (!isInside && wasInside) {
        // Exited fence
        this.triggerFenceAlert(fence, "exited")
      }

      // Update fence status
      this.updateFenceStatus(fence.id, isInside)
    }
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

  // Check if user was inside fence (stored in localStorage)
  private wasInsideFence(fenceId: string): boolean {
    const status = localStorage.getItem(`fence_status_${fenceId}`)
    return status === "inside"
  }

  // Update fence status
  private updateFenceStatus(fenceId: string, isInside: boolean): void {
    localStorage.setItem(`fence_status_${fenceId}`, isInside ? "inside" : "outside")
  }

  // Trigger fence alert
  private triggerFenceAlert(fence: GeoFence, action: "entered" | "exited"): void {
    console.log(`🚨 Geo-fence ${action}: ${fence.name}`)

    fence.lastTriggered = new Date()
    this.saveFencesToStorage()

    // Notify callbacks
    this.alertCallbacks.forEach((callback) => callback(fence, action))

    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      const title = `🚨 ${action === "entered" ? "Entered" : "Exited"} ${fence.name}`
      new Notification(title, {
        body: fence.alertMessage,
        icon: "/favicon.ico",
        requireInteraction: fence.severity === "critical",
      })
    }
  }

  // Add geo-fence
  async addGeoFence(fenceData: Omit<GeoFence, "id" | "createdAt">): Promise<{ success: boolean; fenceId?: string }> {
    try {
      const newFence: GeoFence = {
        ...fenceData,
        id: `fence-${Date.now()}`,
        createdAt: new Date(),
      }

      this.fences.set(newFence.id, newFence)
      await this.saveFencesToStorage()

      console.log(`✅ Geo-fence added: ${newFence.name}`)
      return { success: true, fenceId: newFence.id }
    } catch (error) {
      console.error("❌ Failed to add geo-fence:", error)
      return { success: false }
    }
  }

  // Add default danger zones
  private async addDefaultDangerZones(): Promise<void> {
    const defaultZones: Omit<GeoFence, "id" | "createdAt">[] = [
      {
        name: "Flood Zone Alpha",
        type: "danger",
        coordinates: { lat: 40.7128, lng: -74.006 },
        radius: 1000,
        isActive: true,
        severity: "high",
        alertMessage: "You are entering a flood-prone area. Exercise caution and avoid low-lying areas.",
      },
      {
        name: "Wildfire Risk Area",
        type: "danger",
        coordinates: { lat: 34.0522, lng: -118.2437 },
        radius: 2000,
        isActive: true,
        severity: "critical",
        alertMessage: "High wildfire risk area. Stay alert and be prepared to evacuate if necessary.",
      },
      {
        name: "Emergency Shelter",
        type: "shelter",
        coordinates: { lat: 41.8781, lng: -87.6298 },
        radius: 500,
        isActive: true,
        severity: "low",
        alertMessage: "You are near an emergency shelter. This is a safe zone during disasters.",
      },
    ]

    for (const zone of defaultZones) {
      // Only add if not already exists
      const exists = Array.from(this.fences.values()).some((fence) => fence.name === zone.name)
      if (!exists) {
        await this.addGeoFence(zone)
      }
    }
  }

  // Load geo-fences from storage
  private async loadGeoFences(): Promise<void> {
    try {
      const storedFences = localStorage.getItem("geoFences")
      if (storedFences) {
        const fencesData = JSON.parse(storedFences)
        fencesData.forEach((fenceData: any) => {
          const fence: GeoFence = {
            ...fenceData,
            createdAt: new Date(fenceData.createdAt),
            lastTriggered: fenceData.lastTriggered ? new Date(fenceData.lastTriggered) : undefined,
          }
          this.fences.set(fence.id, fence)
        })
      }
      console.log(`📍 Loaded ${this.fences.size} geo-fences`)
    } catch (error) {
      console.error("❌ Failed to load geo-fences:", error)
    }
  }

  // Save geo-fences to storage
  private async saveFencesToStorage(): Promise<void> {
    try {
      const fencesArray = Array.from(this.fences.values())
      localStorage.setItem("geoFences", JSON.stringify(fencesArray))
    } catch (error) {
      console.error("❌ Failed to save geo-fences:", error)
    }
  }

  // Register callback for fence alerts
  onFenceAlert(callback: (fence: GeoFence, action: "entered" | "exited") => void): void {
    this.alertCallbacks.push(callback)
  }

  // Get all geo-fences
  getGeoFences(): GeoFence[] {
    return Array.from(this.fences.values())
  }

  // Get active geo-fences
  getActiveGeoFences(): GeoFence[] {
    return Array.from(this.fences.values()).filter((fence) => fence.isActive)
  }

  // Stop location watching
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
      this.retryTimeout = null
    }

    this.isWatching = false
    console.log("⏹️ Stopped location watching")
  }

  // Get current location
  getCurrentLocation(): { lat: number; lng: number } | null {
    return this.currentLocation
  }
}

export const geoFencingService = new GeoFencingService()
export type { GeoFence, GeoFenceAlert }
