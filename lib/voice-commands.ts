interface VoiceCommand {
  phrase: string
  action: string
  confidence: number
}

class VoiceCommandService {
  private recognition: any = null
  private isListening = false
  private commandCallbacks: Map<string, () => void> = new Map()

  // Initialize speech recognition
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check for speech recognition support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRecognition) {
        return { success: false, error: "Speech recognition not supported in this browser" }
      }

      this.recognition = new SpeechRecognition()
      this.recognition.continuous = true
      this.recognition.interimResults = false
      this.recognition.lang = "en-US"

      // Set up event handlers
      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1
        const command = event.results[last][0].transcript.toLowerCase().trim()
        const confidence = event.results[last][0].confidence

        console.log(`🎤 Voice command detected: "${command}" (confidence: ${confidence})`)
        this.processCommand(command, confidence)
      }

      this.recognition.onerror = (event: any) => {
        console.error("❌ Speech recognition error:", event.error)
        if (event.error === "not-allowed") {
          alert("Microphone permission is required for voice commands")
        }
      }

      this.recognition.onend = () => {
        if (this.isListening) {
          // Restart recognition if it was supposed to be listening
          setTimeout(() => this.recognition.start(), 1000)
        }
      }

      // Register default emergency commands
      this.registerDefaultCommands()

      console.log("✅ Voice command service initialized")
      return { success: true }
    } catch (error) {
      console.error("❌ Voice command initialization failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Register default emergency commands
  private registerDefaultCommands() {
    this.registerCommand("help me", () => {
      window.location.href = "/help-requests"
    })

    this.registerCommand("emergency", () => {
      this.triggerEmergencyAlert()
    })

    this.registerCommand("call for help", () => {
      window.location.href = "/help-requests"
    })

    this.registerCommand("find volunteers", () => {
      window.location.href = "/volunteer"
    })

    this.registerCommand("weather update", () => {
      window.location.href = "/weather"
    })

    this.registerCommand("show resources", () => {
      window.location.href = "/resources"
    })

    this.registerCommand("stop listening", () => {
      this.stopListening()
    })

    this.registerCommand("start listening", () => {
      this.startListening()
    })
  }

  // Process recognized voice command
  private processCommand(command: string, confidence: number) {
    // Only process commands with reasonable confidence
    if (confidence < 0.7) {
      console.log(`🔇 Command ignored due to low confidence: ${confidence}`)
      return
    }

    // Find matching command
    for (const [phrase, callback] of this.commandCallbacks) {
      if (command.includes(phrase)) {
        console.log(`✅ Executing command: ${phrase}`)
        this.provideFeedback(`Executing: ${phrase}`)
        callback()
        return
      }
    }

    // No matching command found
    console.log(`❓ Unknown command: ${command}`)
    this.provideFeedback('Command not recognized. Try saying "help me" or "emergency"')
  }

  // Provide audio feedback
  private provideFeedback(message: string) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.2
      utterance.pitch = 1
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  // Trigger emergency alert
  private triggerEmergencyAlert() {
    // Show emergency modal or redirect
    const confirmed = confirm("Emergency detected! Do you need immediate assistance?")
    if (confirmed) {
      // Auto-fill emergency form
      const emergencyData = {
        type: "emergency",
        urgency: "critical",
        description: "Emergency assistance requested via voice command",
        timestamp: new Date().toISOString(),
      }

      // Store in session for form auto-fill
      sessionStorage.setItem("emergencyRequest", JSON.stringify(emergencyData))
      window.location.href = "/help-requests"
    }
  }

  // Register a new voice command
  registerCommand(phrase: string, callback: () => void) {
    this.commandCallbacks.set(phrase.toLowerCase(), callback)
    console.log(`📝 Registered voice command: "${phrase}"`)
  }

  // Start listening for voice commands
  startListening() {
    if (!this.recognition) {
      console.error("❌ Speech recognition not initialized")
      return
    }

    try {
      this.isListening = true
      this.recognition.start()
      console.log("🎤 Voice command listening started")
      this.provideFeedback('Voice commands activated. Say "help me" for assistance.')
    } catch (error) {
      console.error("❌ Failed to start voice recognition:", error)
    }
  }

  // Stop listening for voice commands
  stopListening() {
    if (this.recognition && this.isListening) {
      this.isListening = false
      this.recognition.stop()
      console.log("🔇 Voice command listening stopped")
      this.provideFeedback("Voice commands deactivated.")
    }
  }

  // Check if currently listening
  isCurrentlyListening(): boolean {
    return this.isListening
  }

  // Get available commands
  getAvailableCommands(): string[] {
    return Array.from(this.commandCallbacks.keys())
  }
}

export const voiceCommandService = new VoiceCommandService()
export type { VoiceCommand }
