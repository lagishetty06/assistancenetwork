"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Clock, Hospital, Utensils, Home, Shield } from "lucide-react"

interface Resource {
  id: number
  name: string
  type: "medical" | "food" | "shelter" | "emergency"
  address: string
  phone: string
  hours: string
  description: string
  coordinates: { lat: number; lng: number }
  available: boolean
  image?: string
}

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")

  const resources: Resource[] = [
    {
      id: 1,
      name: "Community Medical Center",
      type: "medical",
      address: "123 Main Street, Downtown",
      phone: "(555) 123-4567",
      hours: "24/7 Emergency",
      description: "Full-service hospital with emergency room and urgent care",
      coordinates: { lat: 40.7128, lng: -74.006 },
      available: true,
      image: "/images/medical-facility.png",
    },
    {
      id: 2,
      name: "Food Bank Distribution Center",
      type: "food",
      address: "456 Oak Avenue, Riverside",
      phone: "(555) 234-5678",
      hours: "Mon-Fri 9AM-5PM",
      description: "Free food distribution for families in need",
      coordinates: { lat: 40.7589, lng: -73.9851 },
      available: true,
      image: "/images/food-bank.png",
    },
    {
      id: 3,
      name: "Emergency Shelter",
      type: "shelter",
      address: "789 Pine Street, Westside",
      phone: "(555) 345-6789",
      hours: "24/7",
      description: "Temporary housing for displaced residents",
      coordinates: { lat: 40.7505, lng: -73.9934 },
      available: true,
      image: "/images/emergency-shelter.png",
    },
    {
      id: 4,
      name: "Fire Station #1",
      type: "emergency",
      address: "321 Elm Street, Central",
      phone: "101",
      hours: "24/7",
      description: "Fire and rescue services, emergency response",
      coordinates: { lat: 40.7282, lng: -74.0776 },
      available: true,
      image: "/images/hero-emergency.png",
    },
    {
      id: 5,
      name: "Community Kitchen",
      type: "food",
      address: "654 Maple Drive, Northside",
      phone: "(555) 456-7890",
      hours: "Daily 11AM-7PM",
      description: "Hot meals served daily, no questions asked",
      coordinates: { lat: 40.7831, lng: -73.9712 },
      available: true,
      image: "/images/food-bank.png",
    },
    {
      id: 6,
      name: "Red Cross Shelter",
      type: "shelter",
      address: "987 Cedar Lane, Southside",
      phone: "(555) 567-8901",
      hours: "24/7 During Emergencies",
      description: "Disaster relief shelter and support services",
      coordinates: { lat: 40.6892, lng: -74.0445 },
      available: false,
      image: "/images/emergency-shelter.png",
    },
  ]

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || resource.type === selectedType
    return matchesSearch && matchesType
  })

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "medical":
        return <Hospital className="h-5 w-5 text-red-600" />
      case "food":
        return <Utensils className="h-5 w-5 text-green-600" />
      case "shelter":
        return <Home className="h-5 w-5 text-blue-600" />
      case "emergency":
        return <Shield className="h-5 w-5 text-orange-600" />
      default:
        return <MapPin className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "medical":
        return "bg-red-100 text-red-800"
      case "food":
        return "bg-green-100 text-green-800"
      case "shelter":
        return "bg-blue-100 text-blue-800"
      case "emergency":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Local Resources</h1>
          <p className="text-gray-600">Find medical facilities, food assistance, shelter, and emergency services</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search resources by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button variant={selectedType === "all" ? "default" : "outline"} onClick={() => setSelectedType("all")}>
                  All
                </Button>
                <Button
                  variant={selectedType === "medical" ? "default" : "outline"}
                  onClick={() => setSelectedType("medical")}
                >
                  Medical
                </Button>
                <Button
                  variant={selectedType === "food" ? "default" : "outline"}
                  onClick={() => setSelectedType("food")}
                >
                  Food
                </Button>
                <Button
                  variant={selectedType === "shelter" ? "default" : "outline"}
                  onClick={() => setSelectedType("shelter")}
                >
                  Shelter
                </Button>
                <Button
                  variant={selectedType === "emergency" ? "default" : "outline"}
                  onClick={() => setSelectedType("emergency")}
                >
                  Emergency
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resources List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Resources ({filteredResources.length})</h2>
            <div className="space-y-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className={`overflow-hidden ${!resource.available ? "opacity-60" : ""}`}>
                  {resource.image && (
                    <div
                      className="h-32 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${resource.image})` }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      <div className="absolute top-2 right-2 flex items-center space-x-2">
                        <Badge className={getTypeColor(resource.type)}>
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </Badge>
                        {resource.available ? (
                          <Badge className="bg-green-100 text-green-800">Available</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Unavailable</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getResourceIcon(resource.type)}
                        <h3 className="text-lg font-semibold">{resource.name}</h3>
                      </div>
                      {!resource.image && (
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeColor(resource.type)}>
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </Badge>
                          {resource.available ? (
                            <Badge className="bg-green-100 text-green-800">Available</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Unavailable</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">{resource.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{resource.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{resource.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{resource.hours}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <MapPin className="h-4 w-4 mr-1" />
                        Directions
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Google Maps Integration */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Resource Map</h2>
            <Card>
              <CardContent className="p-0">
                <div className="h-96 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15239.658622643472!2d78.39559795!3d17.2713634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1746545119702!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Local Resources Map"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Map Instructions */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Using the Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Click and drag to navigate the map</p>
                  <p>• Use zoom controls to get a closer view</p>
                  <p>• Click on markers to see resource details</p>
                  <p>• Use the directions feature to get navigation help</p>
                </div>
              </CardContent>
            </Card>

            {/* Map Legend */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Resource Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                    <span className="text-sm">Medical Facilities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    <span className="text-sm">Food Banks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">Shelters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                    <span className="text-sm">Emergency Services</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
