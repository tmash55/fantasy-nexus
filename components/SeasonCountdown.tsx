"use client"

import { useEffect, useMemo, useState } from "react"

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return { days, hours, minutes }
}

export default function SeasonCountdown({ deadline, className }: { deadline: string | Date; className?: string }) {
  const target = useMemo(() => (deadline instanceof Date ? deadline : new Date(deadline)), [deadline])
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000 * 30) // update every 30s
    return () => clearInterval(iv)
  }, [])

  const remaining = target.getTime() - now.getTime()
  if (isNaN(target.getTime()) || remaining <= 0) return null

  const { days, hours, minutes } = formatRemaining(remaining)

  return (
    <div className={className}>
      <span className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/30">
        ⏳ Offer ends in {days}d {hours}h {minutes}m
      </span>
    </div>
  )
}



