"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Mail } from "lucide-react"

interface PhoneAuthFallbackProps {
  onRetry: () => void
  onSwitchToGoogle: () => void
}

export function PhoneAuthFallback({ onRetry, onSwitchToGoogle }: PhoneAuthFallbackProps) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Phone Authentication Unavailable
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-300 bg-orange-100">
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <p>Phone authentication is temporarily unavailable. This could be due to:</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Network connectivity issues</li>
                <li>Browser security settings blocking reCAPTCHA</li>
                <li>Ad blockers interfering with verification</li>
                <li>Firebase configuration issues</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Phone Auth Again
          </Button>

          <Button onClick={onSwitchToGoogle} className="w-full bg-blue-600 hover:bg-blue-700">
            <Mail className="h-4 w-4 mr-2" />
            Use Google Sign-In Instead
          </Button>
        </div>

        <div className="text-xs text-orange-700 space-y-1">
          <p>
            <strong>Troubleshooting tips:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Disable ad blockers and try again</li>
            <li>Try using a different browser</li>
            <li>Check your internet connection</li>
            <li>Clear browser cache and cookies</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
