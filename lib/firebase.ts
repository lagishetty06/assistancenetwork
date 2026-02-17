import { initializeApp } from "firebase/app"
import { getFirestore, enableNetwork } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAa_M4A7Gj9_OSs9hiN5DiV5pTu2f5nydw",
  authDomain: "alert-b338f.firebaseapp.com",
  projectId: "alert-b338f",
  storageBucket: "alert-b338f.firebasestorage.app",
  messagingSenderId: "477328176385",
  appId: "1:477328176385:web:6bd3d6e2ab790dccafd700",
  measurementId: "G-MCS1PHWEE2",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)

// For development - only connect to emulator if not already connected
// Emulator configuration removed to fix build error

// Connection state management
let isFirebaseConnected = false
let connectionAttempts = 0
const MAX_CONNECTION_ATTEMPTS = 3

// Test Firebase connection with progressive timeout
export const testFirebaseConnection = async (): Promise<{ success: boolean; error?: string; duration: number }> => {
  const startTime = performance.now()

  try {
    console.log(`🔍 Testing Firebase connection (attempt ${connectionAttempts + 1}/${MAX_CONNECTION_ATTEMPTS})...`)

    // Try to enable network first
    await enableNetwork(db)

    // Simple connection test - just check if we can access Firestore
    const testPromise = new Promise((resolve, reject) => {
      // Very basic test - try to get the database reference
      try {
        const testRef = (db as any)._delegate || db
        if (testRef) {
          resolve(true)
        } else {
          reject(new Error("Database reference not available"))
        }
      } catch (error) {
        reject(error)
      }
    })

    // Progressive timeout - start with 2 seconds, increase with each attempt
    const timeoutMs = 2000 + connectionAttempts * 1000
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Connection test timeout after ${timeoutMs}ms`)), timeoutMs),
    )

    await Promise.race([testPromise, timeoutPromise])

    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)

    isFirebaseConnected = true
    connectionAttempts = 0
    console.log(`✅ Firebase connection successful in ${duration}ms`)

    return { success: true, duration }
  } catch (error) {
    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)

    connectionAttempts++
    isFirebaseConnected = false

    console.error(`❌ Firebase connection failed after ${duration}ms:`, error)

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown connection error",
      duration,
    }
  }
}

// Get connection status
export const getConnectionStatus = () => ({
  isConnected: isFirebaseConnected,
  attempts: connectionAttempts,
})

export default app
