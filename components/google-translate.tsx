"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

declare global {
    interface Window {
        google: any
        googleTranslateElementInit: () => void
    }
}

export function GoogleTranslate() {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    autoDisplay: false,
                    includedLanguages: "en,es,fr,de,it,pt,zh-CN,ja,ko,ru,ar,hi,bn,te,ta,mr,gu,kn,ml", // Added Indian languages
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                },
                "google_translate_element",
            )
            setIsReady(true)
        }
    }, [])

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50">
                <div
                    id="google_translate_element"
                    className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                    style={{ minHeight: "40px", minWidth: "160px" }}
                />
            </div>
            <Script
                id="google-translate-script"
                src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                strategy="afterInteractive"
            />
            <style jsx global>{`
        .goog-te-banner-frame {
          display: none !important;
        }
        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
          font-family: inherit !important;
        }
        .goog-te-gadget-simple .goog-te-menu-value {
          color: #374151 !important;
        }
        body {
          top: 0px !important;
        }
      `}</style>
        </>
    )
}
