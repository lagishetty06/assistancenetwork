"use client"

import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmergencyAlertProps {
  type: "critical" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  onDismiss?: () => void
}

export function EmergencyAlert({ type, title, message, timestamp, onDismiss }: EmergencyAlertProps) {
  const alertStyles = {
    critical: "bg-red-100 border-red-500 text-red-900",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-900",
    info: "bg-blue-100 border-blue-500 text-blue-900",
  }

  return (
    <div className={`border-l-4 p-4 mb-4 rounded-r-lg ${alertStyles[type]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm mb-2">{message}</p>
            <p className="text-xs opacity-75">{timestamp}</p>
          </div>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="icon" onClick={onDismiss} className="h-6 w-6 opacity-50 hover:opacity-100">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
