"use client"

import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface QuickActionCardProps {
  icon: LucideIcon
  title: string
  description: string
  onClick: () => void
  variant?: "emergency" | "help" | "volunteer" | "info"
}

export function QuickActionCard({ icon: Icon, title, description, onClick, variant = "info" }: QuickActionCardProps) {
  const variants = {
    emergency: "border-red-200 hover:border-red-300 hover:bg-red-50",
    help: "border-orange-200 hover:border-orange-300 hover:bg-orange-50",
    volunteer: "border-green-200 hover:border-green-300 hover:bg-green-50",
    info: "border-blue-200 hover:border-blue-300 hover:bg-blue-50",
  }

  const iconColors = {
    emergency: "text-red-600",
    help: "text-orange-600",
    volunteer: "text-green-600",
    info: "text-blue-600",
  }

  return (
    <Card className={`cursor-pointer transition-all duration-200 ${variants[variant]}`} onClick={onClick}>
      <CardContent className="p-6 text-center">
        <Icon className={`h-12 w-12 mx-auto mb-4 ${iconColors[variant]}`} />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}
