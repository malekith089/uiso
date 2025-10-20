"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Clock } from "lucide-react"

interface DeadlineCountdownProps {
  deadline: string | Date
  onExpired?: () => void
}

export function DeadlineCountdown({ deadline, onExpired }: DeadlineCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isExpired: boolean
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadlineDate = new Date(deadline)
      const now = new Date()
      const difference = deadlineDate.getTime() - now.getTime()

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        })
        onExpired?.()
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [deadline, onExpired])

  if (!timeLeft) return null

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-sm font-medium text-red-700">Deadline telah berakhir</span>
      </div>
    )
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24
  const isCritical = timeLeft.days === 0 && timeLeft.hours < 6

  let bgColor = "bg-green-50"
  let borderColor = "border-green-200"
  let textColor = "text-green-700"
  let iconColor = "text-green-600"

  if (isCritical) {
    bgColor = "bg-red-50"
    borderColor = "border-red-200"
    textColor = "text-red-700"
    iconColor = "text-red-600"
  } else if (isUrgent) {
    bgColor = "bg-yellow-50"
    borderColor = "border-yellow-200"
    textColor = "text-yellow-700"
    iconColor = "text-yellow-600"
  }

  return (
    <div className={`flex items-center gap-2 ${bgColor} border ${borderColor} rounded-lg p-3`}>
      <Clock className={`w-5 h-5 ${iconColor}`} />
      <span className={`text-sm font-medium ${textColor}`}>
        Sisa waktu: {timeLeft.days}h {timeLeft.hours}j {timeLeft.minutes}m {timeLeft.seconds}d
      </span>
    </div>
  )
}
