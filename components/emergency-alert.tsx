"use client"

import { useState } from "react"
import { AlertTriangle, X, ChevronDown, ChevronUp, MapPin, ExternalLink, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmergencyAlertProps {
  type: "critical" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  address?: string
  situation?: string
  link?: string
  onDismiss?: () => void
}

export function EmergencyAlert({ type, title, message, timestamp, address, situation, link, onDismiss }: EmergencyAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const alertStyles = {
    critical: "bg-red-100 border-red-500 text-red-900 border-red-200",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-900 border-yellow-200",
    info: "bg-blue-100 border-blue-500 text-blue-900 border-blue-200",
  }

  const badgeStyles = {
    critical: "bg-red-200 text-red-900",
    warning: "bg-yellow-200 text-yellow-900",
    info: "bg-blue-200 text-blue-900"
  }

  // Prevent parent expansion if the close button is clicked
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDismiss) onDismiss()
  }

  return (
    <div
      className={`border-l-4 p-4 mb-4 rounded-r-lg cursor-pointer transition-all duration-200 hover:shadow-md ${alertStyles[type]} ${isExpanded ? 'shadow-md border border-t border-r border-b' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 w-full">
          <AlertTriangle className={`h-6 w-6 mt-1 flex-shrink-0 ${type === 'critical' ? 'text-red-600 animate-pulse' : type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
          <div className="flex-1">
            <div className="flex justify-between items-start pr-2">
              <h3 className="text-lg font-bold mb-1">{title}</h3>
              {isExpanded ? <ChevronUp className="h-5 w-5 opacity-70" /> : <ChevronDown className="h-5 w-5 opacity-70" />}
            </div>

            {/* Situation & Address badges/text */}
            {(situation || address) && (
              <div className="flex flex-wrap gap-2 mb-2 text-xs font-semibold">
                {situation && (
                  <span className={`px-2.5 py-1 rounded-full ${badgeStyles[type]}`}>
                    {situation}
                  </span>
                )}
                {address && (
                  <span className="flex items-center opacity-80 pt-0.5">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {address}
                  </span>
                )}
              </div>
            )}

            <p className={`text-sm opacity-90 transition-all duration-300 ${isExpanded ? 'mb-4 mt-3 text-base leading-relaxed font-medium' : 'mb-2 line-clamp-1'}`}>
              {message}
            </p>

            {/* Expanded Content Section */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center text-xs font-medium opacity-80">
                  <CalendarClock className="h-4 w-4 mr-1.5" />
                  Reported: {timestamp}
                </div>
                <div className="flex space-x-2">
                  {link && (
                    <Button size="sm" variant="outline" className={`h-8 border-black/20 hover:bg-black/5 shadow-sm bg-white/50`} onClick={(e) => { e.stopPropagation(); window.open(link, '_blank'); }}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Full News Story
                    </Button>
                  )}
                  {type === "critical" && !link && (
                    <Button size="sm" variant="destructive" className="h-8 shadow-sm" onClick={(e) => { e.stopPropagation(); window.location.href = '/help-requests'; }}>
                      Request Help
                    </Button>
                  )}
                  {!link && (
                    <Button size="sm" variant="outline" className={`h-8 border-black/20 hover:bg-black/5 shadow-sm`} onClick={(e) => { e.stopPropagation(); window.location.href = '/resources'; }}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      View Resources
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Collapsed Timestamp */}
            {!isExpanded && <p className="text-xs opacity-75 font-medium">{timestamp}</p>}
          </div>
        </div>
        {onDismiss && !isExpanded && (
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-6 w-6 ml-2 opacity-50 hover:opacity-100 flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
