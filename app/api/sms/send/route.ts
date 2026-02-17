import { type NextRequest, NextResponse } from "next/server"

// Twilio integration (optional - falls back to demo mode)
async function sendViaTwilio(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio credentials not configured")
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twilio API error: ${error}`)
  }

  return await response.json()
}

export async function POST(request: NextRequest) {
  try {
    const { to, message, priority, type } = await request.json()

    console.log(`📤 Sending SMS to ${to}:`, {
      message: message.substring(0, 50) + "...",
      priority,
      type,
      timestamp: new Date().toISOString(),
    })

    // Try Twilio first, fall back to demo mode
    try {
      const result = await sendViaTwilio(to, message)

      return NextResponse.json({
        success: true,
        messageId: result.sid,
        provider: "Twilio",
        to,
        status: result.status,
        timestamp: new Date().toISOString(),
      })
    } catch (twilioError) {
      console.warn("⚠️ Twilio failed, using demo mode:", twilioError)

      // Demo mode - simulate SMS sending
      const messageId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

      // Simulate occasional failures (10% chance)
      if (Math.random() < 0.1) {
        throw new Error("Simulated network error")
      }

      console.log(`📱 [DEMO SMS] To: ${to} | Message: ${message}`)

      return NextResponse.json({
        success: true,
        messageId,
        provider: "Demo",
        to,
        status: "sent",
        timestamp: new Date().toISOString(),
        note: "This is a demo message - no actual SMS was sent",
      })
    }
  } catch (error) {
    console.error("❌ SMS send error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send SMS",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
