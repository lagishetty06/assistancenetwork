import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  limit,
} from "firebase/firestore"
import { db, testFirebaseConnection } from "./firebase"
import { auth } from "./firebase"

export const checkFirebaseConnection = testFirebaseConnection

/* ============================
   Types
============================ */

export interface HelpRequest {
  id?: string
  type: string
  description: string
  urgency: string
  status: "pending" | "accepted" | "in-progress" | "completed"
  requesterName: string
  contact: string
  location: string
  address: string
  city: string
  state: string
  consentToShare: boolean
  createdAt: any
  updatedAt: any

  age?: string
  gender?: string
  alternateContact?: string
  email?: string
  landmark?: string
  pincode?: string
  numberOfPeople?: string
  hasChildren?: boolean
  hasElderly?: boolean
  hasDisabled?: boolean
  medicalConditions?: string
  preferredTime?: string
  availableUntil?: string
  resourcesNeeded?: string
  transportationNeeded?: boolean
  accommodationNeeded?: boolean
  emergencyContact?: {
    name?: string
    phone?: string
    relation?: string
  }
  additionalNotes?: string
  ipAddress?: string
  userAgent?: string
  volunteerId?: string
  volunteerName?: string
  userId?: string
  userEmail?: string
}

/* ============================
   Mock Data (Offline)
============================ */

const mockHelpRequests: HelpRequest[] = [
  {
    id: "mock-1",
    type: "medical",
    description: "Need medical assistance for elderly family member",
    urgency: "urgent",
    status: "pending",
    requesterName: "John Doe",
    contact: "+1234567890",
    location: "123 Main St",
    address: "123 Main St",
    city: "Springfield",
    state: "Illinois",
    consentToShare: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

/* ============================
   Submit Help Request
============================ */

export const submitHelpRequest = async (
  requestData: Omit<HelpRequest, "id" | "status" | "createdAt" | "updatedAt">,
) => {
  const startTime = performance.now()

  try {
    const currentUser = auth.currentUser

    if (!requestData.requesterName || !requestData.contact || !requestData.type) {
      throw new Error("Missing required fields")
    }

    console.log("🔍 Starting Firestore submission diagnosis...")
    console.log("📝 Request data:", requestData)
    console.log("👤 Current user:", currentUser?.uid ?? "Not authenticated")

    const connectionTest = await testFirebaseConnection()

    if (!connectionTest.success) {
      const offlineRequest = {
        ...requestData,
        id: `offline-${Date.now()}`,
        status: "pending" as const,
        userId: currentUser?.uid ?? null,
        userEmail: currentUser?.email ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOffline: true,
      }

      const offline = JSON.parse(localStorage.getItem("offlineHelpRequests") || "[]")
      offline.push(offlineRequest)
      localStorage.setItem("offlineHelpRequests", JSON.stringify(offline))

      return { success: true, id: offlineRequest.id, isOffline: true }
    }

    console.log("📡 Attempting Firestore write to collection: helpRequests")

    const collectionRef = collection(db, "helpRequests")
    console.log("📚 Collection reference:", collectionRef)

    const documentData = {
      ...requestData,
      userId: currentUser?.uid ?? null,
      userEmail: currentUser?.email ?? null,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    console.log("📄 Document data to write:", documentData)

    const docRef = await addDoc(collectionRef, documentData)

    console.log("✅ Firestore write successful!")
    console.log("🆔 Document ID:", docRef.id)
    console.log("🔗 Document reference:", docRef)

    const duration = Math.round(performance.now() - startTime)

    return { success: true, id: docRef.id, duration, isOffline: false }
  } catch (error) {
    console.warn("⚠️ Firestore write failed, falling back to offline mode:", error)

    // Fallback to offline storage
    try {
      // Re-construct the data needed for offline storage
      const currentUser = auth.currentUser
      const offlineRequest = {
        ...requestData,
        id: `offline-fallback-${Date.now()}`,
        status: "pending" as const,
        userId: currentUser?.uid ?? null,
        userEmail: currentUser?.email ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOffline: true,
        syncError: error instanceof Error ? error.message : "Unknown write error"
      }

      if (typeof window !== "undefined") {
        const offline = JSON.parse(localStorage.getItem("offlineHelpRequests") || "[]")
        offline.push(offlineRequest)
        localStorage.setItem("offlineHelpRequests", JSON.stringify(offline))
      }

      const duration = Math.round(performance.now() - startTime)
      console.log("✅ Saved to offline storage (fallback)")

      return {
        success: true,
        id: offlineRequest.id,
        duration,
        isOffline: true,
        message: "Saved locally (connection issue)"
      }
    } catch (localError) {
      console.error("❌ Offline fallback failed:", localError)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Submission failed",
        troubleshooting: "Please check your internet connection and try again.",
      }
    }
  }
}

/* ============================
   Fetch Help Requests
============================ */

export const getHelpRequests = async () => {
  try {
    console.log("🔍 Getting help requests from Firestore...")
    const connectionTest = await testFirebaseConnection()

    if (!connectionTest.success) {
      let offline: any[] = []
      if (typeof window !== "undefined") {
        offline = JSON.parse(localStorage.getItem("offlineHelpRequests") || "[]")
      }
      return {
        success: true,
        data: [...mockHelpRequests, ...offline],
        isOffline: true,
        message: "Using cached data due to connection issues",
      }
    }

    console.log("📡 Reading from Firestore collection: helpRequests")
    const collectionRef = collection(db, "helpRequests")
    console.log("📚 Collection reference for reading:", collectionRef)

    const q = query(collectionRef, orderBy("createdAt", "desc"), limit(50))
    console.log("🔍 Query:", q)

    const snapshot = await getDocs(q)
    console.log("📊 Snapshot received:", snapshot.size, "documents")

    const data: HelpRequest[] = []
    snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as HelpRequest))

    let offline: any[] = []
    if (typeof window !== "undefined") {
      offline = JSON.parse(localStorage.getItem("offlineHelpRequests") || "[]")
    }
    return { success: true, data: [...data, ...offline], isOffline: false }
  } catch (error) {
    let offline: any[] = []
    if (typeof window !== "undefined") {
      offline = JSON.parse(localStorage.getItem("offlineHelpRequests") || "[]")
    }
    return {
      success: true,
      data: [...mockHelpRequests, ...offline],
      isOffline: true,
      message: "Using cached data due to error",
    }
  }
}

/* ============================
   Update Status
============================ */

export const updateHelpRequestStatus = async (
  requestId: string,
  status: HelpRequest["status"],
  volunteerId?: string,
  volunteerName?: string,
) => {
  try {
    const ref = doc(db, "helpRequests", requestId)

    await updateDoc(ref, {
      status,
      volunteerId: volunteerId ?? null,
      volunteerName: volunteerName ?? null,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "Update failed" }
  }
}
