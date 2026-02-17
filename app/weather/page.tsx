"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, Search, MapPin, AlertTriangle } from "lucide-react"

interface WeatherData {
  name: string
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
    deg: number
  }
  visibility: number
  sys: {
    country: string
  }
}

interface WeatherAlert {
  event: string
  description: string
  start: number
  end: number
}

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const API_KEY = "3a99b17a67f9ae0f43e80a630fd1f675"

  useEffect(() => {
    // Get weather for default location on load
    fetchWeatherByCity("New York")
  }, [])

  const fetchWeatherByCity = async (cityName: string) => {
    setLoading(true)
    setError("")

    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`,
      )

      if (!weatherResponse.ok) {
        throw new Error("City not found")
      }

      const weatherData = await weatherResponse.json()
      setWeatherData(weatherData)

      // Fetch weather alerts
      const alertsResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${weatherData.coord?.lat || 0}&lon=${weatherData.coord?.lon || 0}&appid=${API_KEY}&exclude=minutely,hourly,daily`,
      )

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData.alerts || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      setWeatherData(null)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      fetchWeatherByCity(city.trim())
    }
  }

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case "clear":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "clouds":
        return <Cloud className="h-8 w-8 text-gray-500" />
      case "rain":
      case "drizzle":
        return <CloudRain className="h-8 w-8 text-blue-500" />
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weather Updates</h1>
          <p className="text-gray-600">Real-time weather conditions and alerts for your area</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter city name..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button type="submit" disabled={loading} className="px-8">
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Weather Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Weather Alerts
            </h2>
            {alerts.map((alert, index) => (
              <Card key={index} className="mb-4 bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-red-800 mb-2">{alert.event}</h3>
                  <p className="text-red-700 text-sm mb-2">{alert.description}</p>
                  <div className="text-xs text-red-600">
                    <p>Start: {formatDate(alert.start)}</p>
                    <p>End: {formatDate(alert.end)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {weatherData && (
          <>
            {/* Current Weather */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {weatherData.name}, {weatherData.sys.country}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {getWeatherIcon(weatherData.weather[0].main)}
                    <div>
                      <p className="text-4xl font-bold">{Math.round(weatherData.main.temp)}°C</p>
                      <p className="text-gray-600 capitalize">{weatherData.weather[0].description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Feels like</p>
                    <p className="text-2xl font-semibold">{Math.round(weatherData.main.feels_like)}°C</p>
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">Humidity</p>
                    <p className="text-lg font-semibold">{weatherData.main.humidity}%</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Wind className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-gray-600">Wind Speed</p>
                    <p className="text-lg font-semibold">{weatherData.wind.speed} m/s</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Gauge className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm text-gray-600">Pressure</p>
                    <p className="text-lg font-semibold">{weatherData.main.pressure} hPa</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm text-gray-600">Visibility</p>
                    <p className="text-lg font-semibold">{(weatherData.visibility / 1000).toFixed(1)} km</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weather Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Weather Safety Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weatherData.weather[0].main.toLowerCase() === "rain" && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Rainy Weather</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Avoid driving through flooded roads</li>
                        <li>• Keep emergency supplies ready</li>
                        <li>• Stay indoors if possible</li>
                      </ul>
                    </div>
                  )}

                  {weatherData.main.temp > 30 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Hot Weather</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Stay hydrated</li>
                        <li>• Avoid outdoor activities during peak hours</li>
                        <li>• Check on elderly neighbors</li>
                      </ul>
                    </div>
                  )}

                  {weatherData.wind.speed > 10 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Windy Conditions</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Secure loose objects outdoors</li>
                        <li>• Be cautious while driving</li>
                        <li>• Avoid areas with tall trees</li>
                      </ul>
                    </div>
                  )}

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">General Safety</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Keep emergency contacts handy</li>
                      <li>• Monitor weather updates regularly</li>
                      <li>• Have emergency supplies ready</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
