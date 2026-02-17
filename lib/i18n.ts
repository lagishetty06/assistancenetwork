interface Translation {
  [key: string]: string | Translation
}

interface Language {
  code: string
  name: string
  nativeName: string
  rtl: boolean
  translations: Translation
}

class InternationalizationService {
  private currentLanguage = "en"
  private languages: Map<string, Language> = new Map()
  private fallbackLanguage = "en"
  private changeCallbacks: ((language: string) => void)[] = []

  // Initialize i18n service
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      // Load all supported languages
      await this.loadLanguages()

      // Load user's preferred language
      const savedLanguage = localStorage.getItem("preferredLanguage")
      if (savedLanguage && this.languages.has(savedLanguage)) {
        this.currentLanguage = savedLanguage
      } else {
        // Detect browser language
        const browserLang = this.detectBrowserLanguage()
        if (browserLang && this.languages.has(browserLang)) {
          this.currentLanguage = browserLang
        }
      }

      console.log(`✅ i18n initialized with language: ${this.currentLanguage}`)
      return { success: true }
    } catch (error) {
      console.error("❌ i18n initialization failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Load all supported languages
  private async loadLanguages(): Promise<void> {
    // English (default)
    this.languages.set("en", {
      code: "en",
      name: "English",
      nativeName: "English",
      rtl: false,
      translations: {
        common: {
          yes: "Yes",
          no: "No",
          ok: "OK",
          cancel: "Cancel",
          save: "Save",
          delete: "Delete",
          edit: "Edit",
          close: "Close",
          loading: "Loading...",
          error: "Error",
          success: "Success",
          warning: "Warning",
          info: "Information",
        },
        navigation: {
          home: "Home",
          help: "Get Help",
          volunteer: "Volunteer",
          resources: "Resources",
          weather: "Weather",
          about: "About",
          dashboard: "Dashboard",
          profile: "Profile",
          settings: "Settings",
          signIn: "Sign In",
          signOut: "Sign Out",
        },
        emergency: {
          emergency: "Emergency",
          help: "Help",
          critical: "Critical",
          high: "High",
          medium: "Medium",
          low: "Low",
          reportEmergency: "Report Emergency",
          requestHelp: "Request Help",
          callForHelp: "Call for Help",
          emergencyAlert: "Emergency Alert",
          weatherWarning: "Weather Warning",
          evacuate: "Evacuate Immediately",
          stayIndoors: "Stay Indoors",
          seekShelter: "Seek Shelter",
        },
        alerts: {
          activeAlerts: "Active Alerts",
          noAlerts: "No active alerts",
          dismiss: "Dismiss",
          viewDetails: "View Details",
          floodWarning: "Flood Warning",
          fireAlert: "Fire Alert",
          medicalEmergency: "Medical Emergency",
          weatherAlert: "Weather Alert",
          roadClosure: "Road Closure",
        },
        voice: {
          voiceCommands: "Voice Commands",
          listening: "Listening...",
          voiceActive: "Voice Active",
          enableVoice: "Enable Voice",
          sayHelpMe: 'Say "Help Me" for assistance',
          commandNotRecognized: "Command not recognized",
          voiceActivated: "Voice commands activated",
          voiceDeactivated: "Voice commands deactivated",
        },
        geofencing: {
          enteredDangerZone: "Entered danger zone",
          exitedDangerZone: "Exited danger zone",
          floodZone: "Flood Zone",
          wildfireArea: "Wildfire Area",
          emergencyShelter: "Emergency Shelter",
          exerciseCaution: "Exercise caution",
          stayAlert: "Stay alert",
          safeZone: "Safe zone",
        },
        settings: {
          language: "Language",
          selectLanguage: "Select Language",
          notifications: "Notifications",
          privacy: "Privacy",
          preferences: "Preferences",
          soundEffects: "Sound Effects",
          theme: "Theme",
          light: "Light",
          dark: "Dark",
          system: "System",
        },
      },
    })

    // Telugu
    this.languages.set("te", {
      code: "te",
      name: "Telugu",
      nativeName: "తెలుగు",
      rtl: false,
      translations: {
        common: {
          yes: "అవును",
          no: "లేదు",
          ok: "సరే",
          cancel: "రద్దు చేయి",
          save: "సేవ్ చేయి",
          delete: "తొలగించు",
          edit: "సవరించు",
          close: "మూసివేయి",
          loading: "లోడ్ అవుతోంది...",
          error: "లోపం",
          success: "విజయం",
          warning: "హెచ్చరిక",
          info: "సమాచారం",
        },
        navigation: {
          home: "హోమ్",
          help: "సహాయం పొందండి",
          volunteer: "స్వయంసేవకుడు",
          resources: "వనరులు",
          weather: "వాతావరణం",
          about: "గురించి",
          dashboard: "డాష్‌బోర్డ్",
          profile: "ప్రొఫైల్",
          settings: "సెట్టింగ్‌లు",
          signIn: "సైన్ ఇన్",
          signOut: "సైన్ అవుట్",
        },
        emergency: {
          emergency: "అత్యవసరం",
          help: "సహాయం",
          critical: "క్రిటికల్",
          high: "అధిక",
          medium: "మధ్యమ",
          low: "తక్కువ",
          reportEmergency: "అత్యవసర పరిస్థితిని నివేదించండి",
          requestHelp: "సహాయం అభ్యర్థించండి",
          callForHelp: "సహాయం కోసం కాల్ చేయండి",
          emergencyAlert: "అత్యవసర హెచ్చరిక",
          weatherWarning: "వాతావరణ హెచ్చరిక",
          evacuate: "వెంటనే ఖాళీ చేయండి",
          stayIndoors: "ఇంట్లోనే ఉండండి",
          seekShelter: "ఆశ్రయం వెతకండి",
        },
        alerts: {
          activeAlerts: "క్రియాశీల హెచ్చరికలు",
          noAlerts: "క్రియాశీల హెచ్చరికలు లేవు",
          dismiss: "తొలగించు",
          viewDetails: "వివరాలు చూడండి",
          floodWarning: "వరద హెచ్చరిక",
          fireAlert: "అగ్ని హెచ్చరిక",
          medicalEmergency: "వైద్య అత్యవసరం",
          weatherAlert: "వాతావరణ హెచ్చరిక",
          roadClosure: "రోడ్డు మూసివేత",
        },
        voice: {
          voiceCommands: "వాయిస్ కమాండ్‌లు",
          listening: "వింటోంది...",
          voiceActive: "వాయిస్ యాక్టివ్",
          enableVoice: "వాయిస్ ఎనేబుల్ చేయండి",
          sayHelpMe: 'సహాయం కోసం "నాకు సహాయం చేయండి" అని చెప్పండి',
          commandNotRecognized: "కమాండ్ గుర్తించబడలేదు",
          voiceActivated: "వాయిస్ కమాండ్‌లు యాక్టివేట్ చేయబడ్డాయి",
          voiceDeactivated: "వాయిస్ కమాండ్‌లు డీయాక్టివేట్ చేయబడ్డాయి",
        },
        geofencing: {
          enteredDangerZone: "ప్రమాద ప్రాంతంలోకి ప్రవేశించారు",
          exitedDangerZone: "ప్రమాద ప్రాంతం నుండి బయటకు వచ్చారు",
          floodZone: "వరద ప్రాంతం",
          wildfireArea: "అడవి మంట ప్రాంతం",
          emergencyShelter: "అత్యవసర ఆశ్రయం",
          exerciseCaution: "జాగ్రత్త వహించండి",
          stayAlert: "అప్రమత్తంగా ఉండండి",
          safeZone: "సురక్షిత ప్రాంతం",
        },
        settings: {
          language: "భాష",
          selectLanguage: "భాషను ఎంచుకోండి",
          notifications: "నోటిఫికేషన్‌లు",
          privacy: "గోప్యత",
          preferences: "ప్రాధాన్యతలు",
          soundEffects: "సౌండ్ ఎఫెక్ట్‌లు",
          theme: "థీమ్",
          light: "లైట్",
          dark: "డార్క్",
          system: "సిస్టమ్",
        },
      },
    })

    // Hindi
    this.languages.set("hi", {
      code: "hi",
      name: "Hindi",
      nativeName: "हिंदी",
      rtl: false,
      translations: {
        common: {
          yes: "हाँ",
          no: "नहीं",
          ok: "ठीक है",
          cancel: "रद्द करें",
          save: "सेव करें",
          delete: "हटाएं",
          edit: "संपादित करें",
          close: "बंद करें",
          loading: "लोड हो रहा है...",
          error: "त्रुटि",
          success: "सफलता",
          warning: "चेतावनी",
          info: "जानकारी",
        },
        navigation: {
          home: "होम",
          help: "सहायता पाएं",
          volunteer: "स्वयंसेवक",
          resources: "संसाधन",
          weather: "मौसम",
          about: "के बारे में",
          dashboard: "डैशबोर्ड",
          profile: "प्रोफाइल",
          settings: "सेटिंग्स",
          signIn: "साइन इन",
          signOut: "साइन आउट",
        },
        emergency: {
          emergency: "आपातकाल",
          help: "सहायता",
          critical: "गंभीर",
          high: "उच्च",
          medium: "मध्यम",
          low: "कम",
          reportEmergency: "आपातकाल की रिपोर्ट करें",
          requestHelp: "सहायता का अनुरोध करें",
          callForHelp: "सहायता के लिए कॉल करें",
          emergencyAlert: "आपातकालीन अलर्ट",
          weatherWarning: "मौसम चेतावनी",
          evacuate: "तुरंत निकलें",
          stayIndoors: "घर के अंदर रहें",
          seekShelter: "आश्रय की तलाश करें",
        },
        alerts: {
          activeAlerts: "सक्रिय अलर्ट",
          noAlerts: "कोई सक्रिय अलर्ट नहीं",
          dismiss: "खारिज करें",
          viewDetails: "विवरण देखें",
          floodWarning: "बाढ़ चेतावनी",
          fireAlert: "आग अलर्ट",
          medicalEmergency: "चिकित्सा आपातकाल",
          weatherAlert: "मौसम अलर्ट",
          roadClosure: "सड़क बंद",
        },
        voice: {
          voiceCommands: "वॉइस कमांड",
          listening: "सुन रहा है...",
          voiceActive: "वॉइस सक्रिय",
          enableVoice: "वॉइस सक्षम करें",
          sayHelpMe: 'सहायता के लिए "मेरी मदद करें" कहें',
          commandNotRecognized: "कमांड पहचाना नहीं गया",
          voiceActivated: "वॉइस कमांड सक्रिय किए गए",
          voiceDeactivated: "वॉइस कमांड निष्क्रिय किए गए",
        },
        geofencing: {
          enteredDangerZone: "खतरे के क्षेत्र में प्रवेश किया",
          exitedDangerZone: "खतरे के क्षेत्र से बाहर निकले",
          floodZone: "बाढ़ क्षेत्र",
          wildfireArea: "जंगली आग क्षेत्र",
          emergencyShelter: "आपातकालीन आश्रय",
          exerciseCaution: "सावधानी बरतें",
          stayAlert: "सतर्क रहें",
          safeZone: "सुरक्षित क्षेत्र",
        },
        settings: {
          language: "भाषा",
          selectLanguage: "भाषा चुनें",
          notifications: "सूचनाएं",
          privacy: "गोपनीयता",
          preferences: "प्राथमिकताएं",
          soundEffects: "ध्वनि प्रभाव",
          theme: "थीम",
          light: "हल्का",
          dark: "गहरा",
          system: "सिस्टम",
        },
      },
    })

    // Tamil
    this.languages.set("ta", {
      code: "ta",
      name: "Tamil",
      nativeName: "தமிழ்",
      rtl: false,
      translations: {
        common: {
          yes: "ஆம்",
          no: "இல்லை",
          ok: "சரி",
          cancel: "ரத்து செய்",
          save: "சேமி",
          delete: "நீக்கு",
          edit: "திருத்து",
          close: "மூடு",
          loading: "ஏற்றுகிறது...",
          error: "பிழை",
          success: "வெற்றி",
          warning: "எச்சரிக்கை",
          info: "தகவல்",
        },
        navigation: {
          home: "முகப்பு",
          help: "உதவி பெறுங்கள்",
          volunteer: "தன்னார்வலர்",
          resources: "வளங்கள்",
          weather: "வானிலை",
          about: "பற்றி",
          dashboard: "டாஷ்போர்டு",
          profile: "சுயவிவரம்",
          settings: "அமைப்புகள்",
          signIn: "உள்நுழை",
          signOut: "வெளியேறு",
        },
        emergency: {
          emergency: "அவசரநிலை",
          help: "உதவி",
          critical: "முக்கியமான",
          high: "உயர்",
          medium: "நடுத்தர",
          low: "குறைந்த",
          reportEmergency: "அவசரநிலையை புகாரளிக்கவும்",
          requestHelp: "உதவி கோருங்கள்",
          callForHelp: "உதவிக்கு அழைக்கவும்",
          emergencyAlert: "அவசர எச்சரிக்கை",
          weatherWarning: "வானிலை எச்சரிக்கை",
          evacuate: "உடனே வெளியேறுங்கள்",
          stayIndoors: "வீட்டுக்குள் இருங்கள்",
          seekShelter: "தங்குமிடம் தேடுங்கள்",
        },
        alerts: {
          activeAlerts: "செயலில் உள்ள எச்சரிக்கைகள்",
          noAlerts: "செயலில் உள்ள எச்சரிக்கைகள் இல்லை",
          dismiss: "நிராகரி",
          viewDetails: "விவரங்களைப் பார்க்கவும்",
          floodWarning: "வெள்ள எச்சரிக்கை",
          fireAlert: "தீ எச்சரிக்கை",
          medicalEmergency: "மருத்துவ அவசரநிலை",
          weatherAlert: "வானிலை எச்சரிக்கை",
          roadClosure: "சாலை மூடல்",
        },
        voice: {
          voiceCommands: "குரல் கட்டளைகள்",
          listening: "கேட்கிறது...",
          voiceActive: "குரல் செயலில்",
          enableVoice: "குரலை இயக்கவும்",
          sayHelpMe: 'உதவிக்கு "எனக்கு உதவுங்கள்" என்று சொல்லுங்கள்',
          commandNotRecognized: "கட்டளை அடையாளம் காணப்படவில்லை",
          voiceActivated: "குரல் கட்டளைகள் செயல்படுத்தப்பட்டன",
          voiceDeactivated: "குரல் கட்டளைகள் செயலிழக்கப்பட்டன",
        },
        geofencing: {
          enteredDangerZone: "ஆபத்து பகுதியில் நுழைந்தீர்கள்",
          exitedDangerZone: "ஆபத்து பகுதியிலிருந்து வெளியேறினீர்கள்",
          floodZone: "வெள்ள பகுதி",
          wildfireArea: "காட்டுத்தீ பகுதி",
          emergencyShelter: "அவசர தங்குமிடம்",
          exerciseCaution: "எச்சரிக்கையுடன் இருங்கள்",
          stayAlert: "விழிப்புடன் இருங்கள்",
          safeZone: "பாதுகாப்பான பகுதி",
        },
        settings: {
          language: "மொழி",
          selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
          notifications: "அறிவிப்புகள்",
          privacy: "தனியுரிமை",
          preferences: "விருப்பத்தேர்வுகள்",
          soundEffects: "ஒலி விளைவுகள்",
          theme: "தீம்",
          light: "வெளிச்சம்",
          dark: "இருள்",
          system: "அமைப்பு",
        },
      },
    })

    console.log(`🌐 Loaded ${this.languages.size} languages`)
  }

  // Detect browser language
  private detectBrowserLanguage(): string | null {
    const browserLang = navigator.language || (navigator as any).userLanguage
    if (browserLang) {
      // Extract language code (e.g., 'en-US' -> 'en')
      const langCode = browserLang.split("-")[0].toLowerCase()
      return langCode
    }
    return null
  }

  // Get translation for a key
  t(key: string, params?: Record<string, string>): string {
    const language = this.languages.get(this.currentLanguage)
    if (!language) {
      return key
    }

    const translation = this.getNestedTranslation(language.translations, key)
    if (!translation) {
      // Fallback to English
      const fallbackLanguage = this.languages.get(this.fallbackLanguage)
      if (fallbackLanguage) {
        const fallbackTranslation = this.getNestedTranslation(fallbackLanguage.translations, key)
        if (fallbackTranslation) {
          return this.interpolateParams(fallbackTranslation, params)
        }
      }
      return key
    }

    return this.interpolateParams(translation, params)
  }

  // Get nested translation
  private getNestedTranslation(translations: Translation, key: string): string | null {
    const keys = key.split(".")
    let current: any = translations

    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k]
      } else {
        return null
      }
    }

    return typeof current === "string" ? current : null
  }

  // Interpolate parameters in translation
  private interpolateParams(translation: string, params?: Record<string, string>): string {
    if (!params) return translation

    let result = translation
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value)
    }
    return result
  }

  // Change language
  async changeLanguage(languageCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.languages.has(languageCode)) {
        return { success: false, error: "Language not supported" }
      }

      this.currentLanguage = languageCode
      localStorage.setItem("preferredLanguage", languageCode)

      // Notify callbacks
      this.changeCallbacks.forEach((callback) => callback(languageCode))

      console.log(`🌐 Language changed to: ${languageCode}`)
      return { success: true }
    } catch (error) {
      console.error("❌ Failed to change language:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage
  }

  // Get current language info
  getCurrentLanguageInfo(): Language | null {
    return this.languages.get(this.currentLanguage) || null
  }

  // Get all supported languages
  getSupportedLanguages(): Language[] {
    return Array.from(this.languages.values())
  }

  // Check if language is RTL
  isRTL(): boolean {
    const language = this.languages.get(this.currentLanguage)
    return language?.rtl || false
  }

  // Register callback for language changes
  onLanguageChange(callback: (language: string) => void): void {
    this.changeCallbacks.push(callback)
  }

  // Format number according to current locale
  formatNumber(number: number): string {
    const language = this.languages.get(this.currentLanguage)
    const locale = language ? language.code : "en"
    return new Intl.NumberFormat(locale).format(number)
  }

  // Format date according to current locale
  formatDate(date: Date): string {
    const language = this.languages.get(this.currentLanguage)
    const locale = language ? language.code : "en"
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Format time according to current locale
  formatTime(date: Date): string {
    const language = this.languages.get(this.currentLanguage)
    const locale = language ? language.code : "en"
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }
}

export const i18nService = new InternationalizationService()
export type { Language, Translation }
