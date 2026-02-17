"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Heart, Zap, Globe, Target, Award, CheckCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About AAN</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Building resilient communities through technology and collaboration
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                The Alert and Assistance Network (AAN) is dedicated to empowering rural and semi-urban communities with
                a responsive digital platform that enhances emergency preparedness, facilitates community support, and
                builds resilience against various challenges.
              </p>
              <p className="text-gray-600 mb-6">
                We believe that every community deserves access to reliable emergency response systems and mutual
                support networks, regardless of their geographic location or economic status.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800">Emergency Response</Badge>
                <Badge className="bg-green-100 text-green-800">Community Support</Badge>
                <Badge className="bg-purple-100 text-purple-800">Rural Focus</Badge>
                <Badge className="bg-orange-100 text-orange-800">Technology for Good</Badge>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/volunteer-helping.png"
                alt="Community volunteers helping"
                className="rounded-lg shadow-xl w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-Time Alerts</h3>
                <p className="text-gray-600">
                  Instant notifications for weather warnings, emergencies, and community updates to keep everyone
                  informed.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Volunteer Network</h3>
                <p className="text-gray-600">
                  Connect with local volunteers ready to help during emergencies and everyday challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Help Requests</h3>
                <p className="text-gray-600">
                  Easy-to-use system for requesting assistance and coordinating community support efforts.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Resource Directory</h3>
                <p className="text-gray-600">
                  Comprehensive database of local medical facilities, food banks, shelters, and emergency services.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Weather Integration</h3>
                <p className="text-gray-600">
                  Real-time weather data and automated alerts for severe weather conditions and safety tips.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Offline Support</h3>
                <p className="text-gray-600">
                  SMS-based fallback options and offline capabilities for areas with limited internet connectivity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SDG Alignment */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-center text-2xl">UN Sustainable Development Goals Alignment</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-red-600">3</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Good Health & Well-being</h4>
                  <p className="text-sm text-gray-600">
                    Ensuring access to emergency medical services and health resources
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-orange-600">9</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Industry & Infrastructure</h4>
                  <p className="text-sm text-gray-600">
                    Building resilient digital infrastructure for rural communities
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-green-600">11</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Sustainable Communities</h4>
                  <p className="text-sm text-gray-600">Creating inclusive and resilient community support systems</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-600">13</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Climate Action</h4>
                  <p className="text-sm text-gray-600">Providing climate-related emergency preparedness and response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Statistics */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="/images/community-support.png"
                alt="Community impact"
                className="rounded-lg shadow-lg w-full h-64 object-cover"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">1,247</div>
                  <div className="text-gray-600">People helped during emergencies</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">856</div>
                  <div className="text-gray-600">Active volunteers in the network</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-8 w-8 text-purple-600 flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-gray-600">Round-the-clock emergency support</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-8 w-8 text-orange-600 flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-gray-600">User satisfaction rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl mb-6 opacity-90">
              Be part of a network that's making a real difference in emergency response and community support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Become a Volunteer
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors">
                Learn More
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
