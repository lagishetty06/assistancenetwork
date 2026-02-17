"use client"

import { useEffect } from "react"

import { useState } from "react"

import { offlineSMSService } from "./offline-sms-service"

// ========================================
// OFFLINE SMS SERVICE - USAGE EXAMPLES
// ========================================

// Example 1: Initialize the service (call this once in your app)
export async function initializeSMSService() {
  try {
    const result = await offlineSMSService.initialize()

    if (result.success) {
      console.log("✅ SMS Service ready!")
      return true
    } else {
      console.error("❌ SMS Service failed:", result.error)
      return false
    }
  } catch (error) {
    console.error("❌ SMS initialization error:", error)
    return false
  }
}

// Example 2: Send a simple emergency alert
export async function sendEmergencyAlert() {
  try {
    const result = await offlineSMSService.sendEmergencyAlert(
      "+1234567890", // Phone number
      "123 Main St, Downtown", // Location (optional)
      "Medical emergency - need help!", // Custom message (optional)
    )

    if (result.success) {
      console.log("✅ Emergency alert sent!")
      if (result.queued) {
        console.log("📱 Message queued for offline delivery")
      }
    } else {
      console.error("❌ Emergency alert failed:", result.error)
    }

    return result
  } catch (error) {
    console.error("❌ Emergency alert error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Example 3: Send weather alert to multiple people
export async function sendWeatherAlert() {
  try {
    const phoneNumbers = ["+1234567890", "+1234567891", "+1234567892"]
    const weatherData = {
      type: "Severe Thunderstorm",
      description: "Heavy rain and strong winds expected. Seek shelter immediately.",
      severity: "severe",
      location: "Downtown Area",
    }

    const result = await offlineSMSService.sendWeatherAlert(phoneNumbers, weatherData)

    console.log(`📱 Weather alert results:`)
    console.log(`✅ Sent: ${result.sent}`)
    console.log(`❌ Failed: ${result.failed}`)
    console.log(`⏳ Queued: ${result.queued}`)

    return result
  } catch (error) {
    console.error("❌ Weather alert error:", error)
    return { success: false, sent: 0, failed: 0, queued: 0 }
  }
}

// Example 4: Send help request SMS (automatically notifies volunteers)
export async function sendHelpRequestSMS() {
  try {
    const helpRequestData = {
      type: "medical",
      description: "Elderly person fell and cannot get up",
      urgency: "urgent",
      contact: "+1234567890",
      address: "456 Oak Avenue",
      city: "Springfield",
      state: "IL",
      requesterName: "John Doe",
    }

    const result = await offlineSMSService.sendHelpRequestSMS(helpRequestData)

    if (result.success) {
      console.log(`✅ Help request sent to ${result.sentTo} contacts`)
      if (result.queued) {
        console.log("📱 Request queued for offline delivery")
      }
    } else {
      console.error("❌ Help request failed:", result.error)
    }

    return result
  } catch (error) {
    console.error("❌ Help request error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error", sentTo: 0, queued: false }
  }
}

// Example 5: Send a test SMS
export async function sendTestSMS(phoneNumber = "+1234567890") {
  try {
    const result = await offlineSMSService.sendTestSMS(phoneNumber)

    if (result.success) {
      console.log("✅ Test SMS sent successfully!")
    } else {
      console.error("❌ Test SMS failed:", result.error)
    }

    return result
  } catch (error) {
    console.error("❌ Test SMS error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Example 6: Check SMS service status
export function checkSMSStatus() {
  const status = offlineSMSService.getQueueStatus()

  console.log("📊 SMS Service Status:")
  console.log(`🌐 Online: ${status.isOnline}`)
  console.log(`⚡ Initialized: ${status.isInitialized}`)
  console.log(`📱 Total SMS in queue: ${status.smsQueue}`)
  console.log(`📋 Offline requests: ${status.offlineRequests}`)
  console.log(`⏳ Pending: ${status.stats.pending}`)
  console.log(`✅ Sent: ${status.stats.sent}`)
  console.log(`❌ Failed: ${status.stats.failed}`)

  return status
}

// Example 7: Manual sync (force send queued messages)
export async function forceSyncMessages() {
  try {
    // Access private method for manual sync
    await (offlineSMSService as any).syncQueuedMessages()
    console.log("✅ Manual sync completed!")
    return true
  } catch (error) {
    console.error("❌ Manual sync failed:", error)
    return false
  }
}

// Example 8: React Hook for SMS status
export function useSMSStatus() {
  const [status, setStatus] = useState({
    isOnline: true,
    isInitialized: false,
    queueCount: 0,
    stats: { pending: 0, sent: 0, failed: 0 },
  })

  useEffect(() => {
    // Initialize SMS service
    initializeSMSService()

    // Update status every 5 seconds
    const interval = setInterval(() => {
      const currentStatus = offlineSMSService.getQueueStatus()
      setStatus({
        isOnline: currentStatus.isOnline,
        isInitialized: currentStatus.isInitialized,
        queueCount: currentStatus.smsQueue,
        stats: currentStatus.stats,
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return status
}

// ========================================
// INTEGRATION EXAMPLES
// ========================================

// Example 9: Integrate with form submission
export async function handleEmergencyFormSubmit(formData: any) {
  try {
    // 1. Submit to database first
    const dbResult = await fetch("/api/help-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (dbResult.ok) {
      // 2. Send SMS notifications
      const smsResult = await offlineSMSService.sendHelpRequestSMS(formData)

      return {
        success: true,
        message: "Request submitted and notifications sent",
        smsResult,
      }
    } else {
      throw new Error("Database submission failed")
    }
  } catch (error) {
    // Even if database fails, try to send SMS
    const smsResult = await offlineSMSService.sendHelpRequestSMS(formData)

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      smsResult,
    }
  }
}

// Example 10: Network status listener
export function setupNetworkStatusListener() {
  window.addEventListener("online", () => {
    console.log("📶 Network restored - SMS service will auto-sync")
  })

  window.addEventListener("offline", () => {
    console.log("📵 Network lost - SMS messages will be queued")
  })
}

// ========================================
// CONFIGURATION EXAMPLES
// ========================================

// Example 11: Update SMS service configuration
export function configureSMSService() {
  offlineSMSService.updateConfig({
    maxRetries: 5, // Retry failed messages 5 times
    retryDelay: 45000, // Wait 45 seconds between retries
    syncInterval: 30000, // Sync every 30 seconds when online
    emergencyNumbers: ["+1911"], // Emergency contact numbers
    volunteerNumbers: ["+1234567890", "+1234567891"], // Volunteer numbers
  })

  console.log("⚙️ SMS service configuration updated")
}

// Example 12: Cleanup when app closes
export function cleanupSMSService() {
  offlineSMSService.destroy()
  console.log("🧹 SMS service cleaned up")
}
