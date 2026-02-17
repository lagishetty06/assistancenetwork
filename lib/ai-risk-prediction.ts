interface RiskFactor {
  type: "weather" | "geological" | "health" | "infrastructure" | "social"
  severity: number // 0-1 scale
  confidence: number // 0-1 scale
  description: string
  timeframe: "immediate" | "short-term" | "medium-term" | "long-term"
  riskLevel: "low" | "medium" | "high" | "critical"
  probability: number // 0-1 scale
  source: string
}

interface RiskPrediction {
  id: string
  location: {
    lat: number
    lng: number
    address: string
  }
  overallRisk: number // 0-1 scale
  confidenceScore: number // 0-1 scale
  factors: RiskFactor[]
  recommendations: string[]
  timestamp: Date
  validUntil: Date
}

interface HistoricalData {
  date: Date
  eventType: string
  severity: number
  location: { lat: number; lng: number }
  casualties?: number
  damageLevel?: number
  weatherConditions?: any
}

class AIRiskPredictionService {
  private historicalData: HistoricalData[] = []
  private currentPredictions: Map<string, RiskPrediction> = new Map()
  private predictionCallbacks: ((prediction: RiskPrediction) => void)[] = []

  // Initialize the AI risk prediction service
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      // Load historical data
      await this.loadHistoricalData()

      // Start periodic risk assessment
      this.startPeriodicAssessment()

      console.log("✅ AI Risk Prediction service initialized")
      return { success: true }
    } catch (error) {
      console.error("❌ AI Risk Prediction initialization failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Load historical emergency data
  private async loadHistoricalData() {
    try {
      // In a real implementation, this would fetch from your database
      const mockHistoricalData: HistoricalData[] = [
        {
          date: new Date("2023-08-15"),
          eventType: "flood",
          severity: 0.8,
          location: { lat: 40.7128, lng: -74.006 },
          casualties: 5,
          damageLevel: 0.7,
          weatherConditions: { rainfall: 150, windSpeed: 45 },
        },
        {
          date: new Date("2023-09-22"),
          eventType: "wildfire",
          severity: 0.9,
          location: { lat: 34.0522, lng: -118.2437 },
          casualties: 12,
          damageLevel: 0.9,
          weatherConditions: { temperature: 38, humidity: 15, windSpeed: 60 },
        },
        {
          date: new Date("2023-11-03"),
          eventType: "medical_outbreak",
          severity: 0.6,
          location: { lat: 41.8781, lng: -87.6298 },
          casualties: 23,
          damageLevel: 0.3,
        },
      ]

      this.historicalData = mockHistoricalData
      console.log(`📊 Loaded ${this.historicalData.length} historical events`)
    } catch (error) {
      console.error("❌ Failed to load historical data:", error)
    }
  }

  // Start periodic risk assessment
  private startPeriodicAssessment() {
    // Run initial assessment
    this.performRiskAssessment()

    // Schedule periodic assessments (every 30 minutes)
    setInterval(
      () => {
        this.performRiskAssessment()
      },
      30 * 60 * 1000,
    )
  }

  // Perform AI-based risk assessment (Public wrapper)
  public async performRiskAssessment(): Promise<{ success: boolean; prediction?: RiskPrediction; error?: string }> {
    try {
      const location = await this.getCurrentLocation()
      if (!location) return { success: false, error: "Location unavailable" }

      const prediction = await this.predictRisk(location.lat, location.lng)
      return { success: true, prediction }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Predict risk for specific coordinates
  public async predictRisk(lat: number, lng: number): Promise<RiskPrediction> {
    const location = { lat, lng }

    // Analyze multiple risk factors
    const weatherRisk = await this.analyzeWeatherRisk(location)
    const historicalRisk = this.analyzeHistoricalRisk(location)
    const infrastructureRisk = this.analyzeInfrastructureRisk(location)
    const socialRisk = this.analyzeSocialRisk(location)

    // Combine risk factors
    const factors: RiskFactor[] = [weatherRisk, historicalRisk, infrastructureRisk, socialRisk]
    const overallRisk = this.calculateOverallRisk(factors)
    const confidenceScore = factors.reduce((sum, f) => sum + f.confidence, 0) / factors.length

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, overallRisk)

    // Create prediction
    const prediction: RiskPrediction = {
      id: `prediction-${Date.now()}`,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: "Analyzed Location",
      },
      overallRisk,
      confidenceScore,
      factors,
      recommendations,
      timestamp: new Date(),
      validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // Valid for 2 hours
    }

    // Store prediction
    this.currentPredictions.set(prediction.id, prediction)

    // Notify callbacks if risk is significant
    if (overallRisk > 0.6) {
      this.notifyHighRisk(prediction)
    }

    console.log(`📈 Risk assessment complete. Overall risk: ${(overallRisk * 100).toFixed(1)}%`)
    return prediction
  }

  // Analyze weather-based risk
  private async analyzeWeatherRisk(location: { lat: number; lng: number }): Promise<RiskFactor> {
    try {
      // In a real app, this would call weather APIs
      const mockWeatherData = {
        temperature: 32,
        humidity: 85,
        windSpeed: 25,
        precipitation: 15,
        pressure: 1010,
        alerts: ["heavy_rain_warning"],
      }

      let severity = 0
      let description = "Weather conditions are normal"

      // Analyze weather patterns
      if (mockWeatherData.alerts.length > 0) {
        severity += 0.4
        description = "Weather alerts active in your area"
      }

      if (mockWeatherData.windSpeed > 50) {
        severity += 0.3
        description += ". High winds detected"
      }

      if (mockWeatherData.precipitation > 20) {
        severity += 0.3
        description += ". Heavy precipitation expected"
      }

      return {
        type: "weather",
        severity: Math.min(severity, 1),
        confidence: 0.85,
        description,
        timeframe: "immediate",
        riskLevel: severity > 0.7 ? "high" : severity > 0.4 ? "medium" : "low",
        probability: 0.9,
        source: "Weather API"
      }
    } catch (error) {
      return {
        type: "weather",
        severity: 0,
        confidence: 0.1,
        description: "Weather data unavailable",
        timeframe: "immediate",
        riskLevel: "low",
        probability: 0,
        source: "System Error"
      }
    }
  }

  // Analyze historical risk patterns
  private analyzeHistoricalRisk(location: { lat: number; lng: number }): RiskFactor {
    const nearbyEvents = this.historicalData.filter((event) => {
      const distance = this.calculateDistance(location.lat, location.lng, event.location.lat, event.location.lng)
      return distance < 50000 // Within 50km
    })

    const recentEvents = nearbyEvents.filter((event) => {
      const daysSince = (Date.now() - event.date.getTime()) / (1000 * 60 * 60 * 24)
      return daysSince < 365 // Within last year
    })

    let severity = 0
    let description = "No significant historical events in this area"

    if (recentEvents.length > 0) {
      const avgSeverity = recentEvents.reduce((sum, event) => sum + event.severity, 0) / recentEvents.length
      severity = avgSeverity * 0.7 // Historical events have lower immediate impact
      description = `${recentEvents.length} significant events in the past year`
    }

    return {
      type: "geological",
      severity,
      confidence: 0.9,
      description,
      timeframe: "medium-term",
      riskLevel: severity > 0.7 ? "high" : severity > 0.4 ? "medium" : "low",
      probability: severity > 0 ? 0.4 : 0.1,
      source: "Historical Database"
    }
  }

  // Analyze infrastructure risk
  private analyzeInfrastructureRisk(location: { lat: number; lng: number }): RiskFactor {
    // Mock infrastructure analysis
    const mockInfrastructureData = {
      hospitalDistance: 15000, // meters
      fireStationDistance: 8000,
      policeStationDistance: 5000,
      roadQuality: 0.7, // 0-1 scale
      powerGridReliability: 0.8,
      communicationCoverage: 0.9,
    }

    let severity = 0
    let description = "Infrastructure is adequate"

    if (mockInfrastructureData.hospitalDistance > 20000) {
      severity += 0.3
      description = "Limited access to medical facilities"
    }

    if (mockInfrastructureData.powerGridReliability < 0.6) {
      severity += 0.2
      description += ". Power grid reliability concerns"
    }

    if (mockInfrastructureData.communicationCoverage < 0.7) {
      severity += 0.2
      description += ". Poor communication coverage"
    }

    return {
      type: "infrastructure",
      severity: Math.min(severity, 1),
      confidence: 0.75,
      description,
      timeframe: "long-term",
      riskLevel: severity > 0.7 ? "high" : severity > 0.4 ? "medium" : "low",
      probability: 0.8,
      source: "City Infrastructure Data"
    }
  }

  // Analyze social/demographic risk factors
  private analyzeSocialRisk(location: { lat: number; lng: number }): RiskFactor {
    // Mock social risk analysis
    const mockSocialData = {
      populationDensity: 1200, // per km²
      elderlyPercentage: 0.18,
      disabilityPercentage: 0.12,
      povertyRate: 0.15,
      volunteerAvailability: 0.6,
    }

    let severity = 0
    let description = "Community resilience is good"

    if (mockSocialData.elderlyPercentage > 0.2) {
      severity += 0.2
      description = "High elderly population requires special attention"
    }

    if (mockSocialData.volunteerAvailability < 0.4) {
      severity += 0.3
      description += ". Limited volunteer availability"
    }

    if (mockSocialData.povertyRate > 0.2) {
      severity += 0.2
      description += ". Economic vulnerability factors present"
    }

    return {
      type: "social",
      severity: Math.min(severity, 1),
      confidence: 0.7,
      description,
      timeframe: "long-term",
      riskLevel: "low", // Default to low for social
      probability: 0.6,
      source: "Demographic Census"
    }
  }

  // Calculate overall risk from multiple factors
  private calculateOverallRisk(factors: RiskFactor[]): number {
    const weightedRisks = factors.map((factor) => {
      const weight = this.getFactorWeight(factor.type)
      return factor.severity * factor.confidence * weight
    })

    const totalWeight = factors.reduce((sum, factor) => sum + this.getFactorWeight(factor.type), 0)
    const weightedSum = weightedRisks.reduce((sum, risk) => sum + risk, 0)

    return Math.min(weightedSum / totalWeight, 1)
  }

  // Get weight for different risk factor types
  private getFactorWeight(type: RiskFactor["type"]): number {
    const weights = {
      weather: 0.4,
      geological: 0.3,
      infrastructure: 0.15,
      health: 0.35,
      social: 0.1,
    }
    return weights[type] || 0.1
  }

  // Generate recommendations based on risk factors
  private generateRecommendations(factors: RiskFactor[], overallRisk: number): string[] {
    const recommendations: string[] = []

    if (overallRisk > 0.8) {
      recommendations.push("Consider evacuation or shelter-in-place procedures")
      recommendations.push("Ensure emergency supplies are readily available")
    } else if (overallRisk > 0.6) {
      recommendations.push("Stay alert and monitor emergency channels")
      recommendations.push("Review your emergency plan with family members")
    } else if (overallRisk > 0.4) {
      recommendations.push("Check emergency supplies and communication devices")
    }

    // Factor-specific recommendations
    factors.forEach((factor) => {
      if (factor.severity > 0.6) {
        switch (factor.type) {
          case "weather":
            recommendations.push("Monitor weather updates closely")
            break
          case "geological":
            recommendations.push("Be aware of historical risk patterns in your area")
            break
          case "infrastructure":
            recommendations.push("Identify alternative routes and communication methods")
            break
          case "social":
            recommendations.push("Check on vulnerable community members")
            break
        }
      }
    })

    return [...new Set(recommendations)] // Remove duplicates
  }

  // Notify about high risk situations
  private notifyHighRisk(prediction: RiskPrediction) {
    console.log("🚨 High risk situation detected!")

    // Notify all registered callbacks
    this.predictionCallbacks.forEach((callback) => callback(prediction))

    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⚠️ Risk Alert", {
        body: `Risk level: ${(prediction.overallRisk * 100).toFixed(0)}%. ${prediction.recommendations[0]}`,
        icon: "/favicon.ico",
        requireInteraction: true,
      })
    }
  }

  // Get current location
  private getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
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

  // Register callback for risk predictions
  onRiskPrediction(callback: (prediction: RiskPrediction) => void) {
    this.predictionCallbacks.push(callback)
  }

  // Get current predictions
  getCurrentPredictions(): RiskPrediction[] {
    return Array.from(this.currentPredictions.values())
  }

  // Get risk level for specific location
  async getRiskForLocation(lat: number, lng: number): Promise<RiskPrediction | null> {
    // Find existing prediction for this location or create new one
    const existingPrediction = Array.from(this.currentPredictions.values()).find((p) => {
      const distance = this.calculateDistance(lat, lng, p.location.lat, p.location.lng)
      return distance < 5000 // Within 5km
    })

    return existingPrediction || null
  }
}

export const aiRiskPredictionService = new AIRiskPredictionService()
export type { RiskPrediction, RiskFactor, HistoricalData }
