"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Database, 
  Wifi, 
  WifiOff, 
  Upload, 
  Download, 
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"
import { submitHelpRequest, getHelpRequests } from "@/lib/firebase-services"
import { testFirebaseConnection } from "@/lib/firebase"
import { db } from "@/lib/firebase"

export default function DiagnosticsPage() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([])
  const [testData, setTestData] = useState({
    requesterName: "Test User",
    contact: "+1234567890",
    type: "medical",
    description: "Test help request for diagnostics",
    urgency: "moderate",
    address: "123 Test Street",
    city: "Test City",
    state: "Test State",
    location: "123 Test Street, Test City, Test State",
    consentToShare: true
  })
  const [isTestingWrite, setIsTestingWrite] = useState(false)
  const [isTestingRead, setIsTestingRead] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDiagnosticLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  const testConnection = async () => {
    setConnectionStatus("checking")
    addLog("🔍 Testing Firebase connection...")
    
    try {
      const result = await testFirebaseConnection()
      if (result.success) {
        setConnectionStatus("connected")
        addLog(`✅ Connection successful! Duration: ${result.duration}ms`)
      } else {
        setConnectionStatus("disconnected")
        addLog(`❌ Connection failed: ${result.error}`)
      }
    } catch (error) {
      setConnectionStatus("disconnected")
      addLog(`❌ Connection test error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const testWriteOperation = async () => {
    setIsTestingWrite(true)
    addLog("📝 Testing Firestore write operation...")
    
    try {
      const result = await submitHelpRequest(testData)
      if (result.success) {
        addLog(`✅ Write successful! Document ID: ${result.id}`)
        if (result.duration) {
          addLog(`⏱️ Write duration: ${result.duration}ms`)
        }
        if (result.isOffline) {
          addLog("⚠️ Data stored offline (will sync when online)")
        }
      } else {
        addLog(`❌ Write failed: ${result.error}`)
      }
    } catch (error) {
      addLog(`❌ Write error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsTestingWrite(false)
    }
  }

  const testReadOperation = async () => {
    setIsTestingRead(true)
    addLog("📖 Testing Firestore read operation...")
    
    try {
      const result = await getHelpRequests()
      if (result.success) {
        addLog(`✅ Read successful! Found ${result.data?.length || 0} documents`)
        if (result.isOffline) {
          addLog("⚠️ Reading from offline storage")
        }
        addLog(`📄 Sample data: ${JSON.stringify(result.data?.slice(0, 2), null, 2)}`)
      } else {
        // getHelpRequests always returns success=true, so this shouldn't happen
        addLog(`❌ Unexpected read failure`)
      }
    } catch (error) {
      addLog(`❌ Read error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsTestingRead(false)
    }
  }

  const clearLogs = () => {
    setDiagnosticLogs([])
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Firestore Diagnostics</h1>
          <p className="text-gray-600">Debug Firestore connectivity and operations</p>
        </div>

        {/* Connection Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Firebase Connection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {connectionStatus === "checking" && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    <span className="text-gray-600">Checking connection...</span>
                  </>
                )}
                {connectionStatus === "connected" && (
                  <>
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Connected</span>
                  </>
                )}
                {connectionStatus === "disconnected" && (
                  <>
                    <WifiOff className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">Disconnected</span>
                  </>
                )}
              </div>
              <Button onClick={testConnection} variant="outline" size="sm">
                Re-test Connection
              </Button>
            </div>
            
            {/* Test Data Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="requesterName">Requester Name</Label>
                <Input
                  id="requesterName"
                  value={testData.requesterName}
                  onChange={(e) => setTestData({...testData, requesterName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={testData.contact}
                  onChange={(e) => setTestData({...testData, contact: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={testData.type}
                  onChange={(e) => setTestData({...testData, type: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Input
                  id="urgency"
                  value={testData.urgency}
                  onChange={(e) => setTestData({...testData, urgency: e.target.value})}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={testData.description}
                onChange={(e) => setTestData({...testData, description: e.target.value})}
                rows={2}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={testWriteOperation} 
                disabled={isTestingWrite || connectionStatus === "checking"}
                className="flex items-center space-x-2"
              >
                {isTestingWrite ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{isTestingWrite ? "Writing..." : "Test Write"}</span>
              </Button>
              
              <Button 
                onClick={testReadOperation} 
                disabled={isTestingRead || connectionStatus === "checking"}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                {isTestingRead ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{isTestingRead ? "Reading..." : "Test Read"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostic Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Diagnostic Logs</span>
              </div>
              <Button onClick={clearLogs} variant="outline" size="sm">
                Clear Logs
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {diagnosticLogs.length === 0 ? (
                <p className="text-gray-400">No diagnostic logs yet. Run tests above to see logs.</p>
              ) : (
                diagnosticLogs.map((log, index) => (
                  <div key={index} className="text-gray-300 mb-1">
                    {log.startsWith("[") ? log : `• ${log}`}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}