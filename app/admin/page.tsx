import { SMSStatus } from "@/components/sms-status"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Example Cards - Replace with your actual content */}
        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-2">Card 1</h2>
          <p>Some content for card 1.</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-2">Card 2</h2>
          <p>Some content for card 2.</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-2">Card 3</h2>
          <p>Some content for card 3.</p>
        </div>

        {/* Add this after the existing cards */}
        <div className="lg:col-span-2">
          <SMSStatus />
        </div>
      </div>
    </div>
  )
}
