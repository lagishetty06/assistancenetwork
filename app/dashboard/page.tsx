"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { EmergencyAlert } from "@/components/emergency-alert"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Users, Heart, MapPin, Clock, CheckCircle, XCircle } from "lucide-react"

export default function DashboardPage() {
  const [alerts] = useState([
    {
      id: 1,
      type: "critical" as const,
      title: "Flash Flood Warning",
      message: "Immediate evacuation recommended for residents near Riverside Drive.",
      timestamp: "5 minutes ago",
    },
    {
      id: 2,
      type: "warning" as const,
      title: "Power Outage",
      message: "Scheduled maintenance will cause power outage from 2-4 PM today.",
      timestamp: "1 hour ago",
    },
    {
      id: 3,
      type: "info" as const,
      title: "Community Meeting",
      message: "Emergency preparedness meeting scheduled for Saturday 10 AM at Community Center.",
      timestamp: "3 hours ago",
    },
  ])

  const [helpRequests] = useState([
    {
      id: 1,
      type: "Medical",
      description: "Elderly resident needs medication pickup",
      location: "Oak Street",
      status: "pending",
      timestamp: "10 minutes ago",
    },
    {
      id: 2,
      type: "Transportation",
      description: "Family needs evacuation assistance",
      location: "Riverside Drive",
      status: "in-progress",
      timestamp: "25 minutes ago",
    },
    {
      id: 3,
      type: "Supplies",
      description: "Food and water needed for shelter",
      location: "Community Center",
      status: "completed",
      timestamp: "2 hours ago",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in-progress":
        return <Users className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Dashboard</h1>
          <p className="text-gray-600">Monitor alerts, help requests, and community activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Help Requests</p>
                  <p className="text-2xl font-bold text-orange-600">5</p>
                </div>
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resources Available</p>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Alerts */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <EmergencyAlert
                  key={alert.id}
                  type={alert.type}
                  title={alert.title}
                  message={alert.message}
                  timestamp={alert.timestamp}
                />
              ))}
            </div>
          </div>

          {/* Help Requests */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Help Requests</h2>
            <div className="space-y-4">
              {helpRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{request.type}</Badge>
                        <Badge className={getStatusColor(request.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(request.status)}
                            <span className="capitalize">{request.status}</span>
                          </div>
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">{request.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{request.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{request.location}</span>
                      </div>
                      {request.status === "pending" && (
                        <Button size="sm" variant="outline">
                          Respond
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
