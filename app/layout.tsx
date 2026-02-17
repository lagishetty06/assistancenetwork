import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { GoogleTranslate } from "@/components/google-translate"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Alert and Assistance Network (AAN)",
  description: "Emergency response and community support platform for rural and semi-urban areas",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <GoogleTranslate />
      </body>
    </html>
  )
}
