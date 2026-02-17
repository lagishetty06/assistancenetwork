import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simulate API test
    console.log("📱 SMS API Test Request:", body)

    // Check if we have Twilio credentials (optional for demo)
    const hasCredentials =
      process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER

    if (hasCredentials) {
      return NextResponse.json({
        success: true,
        message: "SMS API is configured and ready",
        provider: "Twilio",
        testMode: false,
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "SMS API running in demo mode",
        provider: "Demo",
        testMode: true,
      })
    }
  } catch (error) {
    console.error("❌ SMS API test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "SMS API test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
