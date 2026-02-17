"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SettingsIcon, Bell, Shield, Globe, Volume2, Smartphone, Mail, CheckCircle, AlertTriangle } from "lucide-react"
import { i18nService } from "@/lib/i18n"
import { LanguageSelector } from "@/components/language-selector"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      emergencyAlerts: true,
      helpRequests: true,
      volunteerUpdates: true,
      emailNotifications: false,
      smsNotifications: true,
      pushNotifications: true,
    },
    privacy: {
      profileVisibility: "public",
      locationSharing: true,
      contactSharing: false,
    },
    preferences: {
      language: "en",
      theme: "light",
      soundEnabled: true,
    },
  })

  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [translations, setTranslations] = useState<any>({})

  useEffect(() => {
    initializeSettings()
  }, [])

  const initializeSettings = async () => {
    await i18nService.initialize()
    updateTranslations()

    i18nService.onLanguageChange(() => {
      updateTranslations()
    })
  }

  const updateTranslations = () => {
    setTranslations({
      settings: i18nService.t("settings.language"),
      selectLanguage: i18nService.t("settings.selectLanguage"),
      notifications: i18nService.t("settings.notifications"),
      privacy: i18nService.t("settings.privacy"),
      preferences: i18nService.t("settings.preferences"),
      soundEffects: i18nService.t("settings.soundEffects"),
      theme: i18nService.t("settings.theme"),
      light: i18nService.t("settings.light"),
      dark: i18nService.t("settings.dark"),
      system: i18nService.t("settings.system"),
    })
  }

  const handleSave = () => {
    // Simulate saving settings
    setSuccess("Settings saved successfully!")
    setTimeout(() => setSuccess(null), 3000)
  }

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
  }

  const updatePrivacySetting = (key: string, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }))
  }

  const updatePreferenceSetting = (key: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }))
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <SettingsIcon className="h-8 w-8 mr-3 text-red-600" />
              Settings
            </h1>
            <p className="text-gray-600">Manage your account preferences and privacy settings</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emergency-alerts" className="text-base font-medium">
                        Emergency Alerts
                      </Label>
                      <p className="text-sm text-gray-600">Receive critical emergency notifications</p>
                    </div>
                    <Switch
                      id="emergency-alerts"
                      checked={settings.notifications.emergencyAlerts}
                      onCheckedChange={(checked) => updateNotificationSetting("emergencyAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="help-requests" className="text-base font-medium">
                        Help Request Updates
                      </Label>
                      <p className="text-sm text-gray-600">Get notified about help request status changes</p>
                    </div>
                    <Switch
                      id="help-requests"
                      checked={settings.notifications.helpRequests}
                      onCheckedChange={(checked) => updateNotificationSetting("helpRequests", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="volunteer-updates" className="text-base font-medium">
                        Volunteer Opportunities
                      </Label>
                      <p className="text-sm text-gray-600">Receive notifications about new volunteer opportunities</p>
                    </div>
                    <Switch
                      id="volunteer-updates"
                      checked={settings.notifications.volunteerUpdates}
                      onCheckedChange={(checked) => updateNotificationSetting("volunteerUpdates", checked)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Notification Methods</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) => updateNotificationSetting("emailNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-2 text-gray-500" />
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={settings.notifications.smsNotifications}
                        onCheckedChange={(checked) => updateNotificationSetting("smsNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="h-4 w-4 mr-2 text-gray-500" />
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={settings.notifications.pushNotifications}
                        onCheckedChange={(checked) => updateNotificationSetting("pushNotifications", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Profile Visibility</Label>
                      <p className="text-sm text-gray-600">Control who can see your profile information</p>
                    </div>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onValueChange={(value) => updatePrivacySetting("profileVisibility", value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="volunteers">Volunteers Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="location-sharing" className="text-base font-medium">
                        Location Sharing
                      </Label>
                      <p className="text-sm text-gray-600">
                        Allow volunteers to see your general location for help requests
                      </p>
                    </div>
                    <Switch
                      id="location-sharing"
                      checked={settings.privacy.locationSharing}
                      onCheckedChange={(checked) => updatePrivacySetting("locationSharing", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="contact-sharing" className="text-base font-medium">
                        Contact Information Sharing
                      </Label>
                      <p className="text-sm text-gray-600">Allow volunteers to see your contact details</p>
                    </div>
                    <Switch
                      id="contact-sharing"
                      checked={settings.privacy.contactSharing}
                      onCheckedChange={(checked) => updatePrivacySetting("contactSharing", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-purple-600" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium">{translations.settings || "Language"}</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      {translations.selectLanguage || "Choose your preferred language"}
                    </p>
                    <LanguageSelector />
                  </div>

                  <div>
                    <Label className="text-base font-medium">{translations.theme || "Theme"}</Label>
                    <p className="text-sm text-gray-600 mb-2">Choose your preferred theme</p>
                    <Select
                      value={settings.preferences.theme}
                      onValueChange={(value) => updatePreferenceSetting("theme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">{translations.light || "Light"}</SelectItem>
                        <SelectItem value="dark">{translations.dark || "Dark"}</SelectItem>
                        <SelectItem value="system">{translations.system || "System"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Volume2 className="h-4 w-4 mr-2 text-gray-500" />
                    <div>
                      <Label htmlFor="sound-enabled" className="text-base font-medium">
                        Sound Effects
                      </Label>
                      <p className="text-sm text-gray-600">Enable sound effects for notifications</p>
                    </div>
                  </div>
                  <Switch
                    id="sound-enabled"
                    checked={settings.preferences.soundEnabled}
                    onCheckedChange={(checked) => updatePreferenceSetting("soundEnabled", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
                Save All Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
