// Utilities to compute NFL weekly windows (Thursday -> Monday) and filter items

export interface WeekWindow {
  week: number
  start: Date // UTC start
  end: Date   // UTC end
  seasonYear: number
}

export const DEFAULT_TZ = "America/Chicago"

function toUTCDate(year: number, monthIndex: number, day: number): Date {
  // monthIndex: 0-based (0=Jan)
  return new Date(Date.UTC(year, monthIndex, day, 0, 0, 0))
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime())
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function firstMondayOfSeptember(year: number): Date {
  const sept1 = toUTCDate(year, 8, 1) // Sept=8
  const day = sept1.getUTCDay() // 0=Sun, 1=Mon, ...
  const offset = (8 - day) % 7 // days to next Monday
  return addDays(sept1, offset)
}

export function getSeasonStartThursday(year: number): Date {
  const laborDayMonday = firstMondayOfSeptember(year)
  // NFL season opener is the Thursday following Labor Day Monday
  return addDays(laborDayMonday, 3)
}

export function getSeasonYearForDate(current: Date): number {
  // If in Jan/Feb, it's still the previous season
  const month = current.getUTCMonth() // 0=Jan
  const year = current.getUTCFullYear()
  if (month <= 1) return year - 1
  return year
}

// Compute the timezone offset (ms) for a given UTC date and IANA timezone
function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const parts = dtf.formatToParts(date)
  const map: any = {}
  for (const p of parts) map[p.type] = p.value
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  )
  return asUTC - date.getTime()
}

export function getWeekWindowForDate(date: Date, seasonYear?: number, timeZone: string = DEFAULT_TZ): WeekWindow {
  // Work in local (zone) time by shifting UTC by the zone offset at 'now'
  const offsetNow = getTimeZoneOffsetMs(date, timeZone)
  const nowLocal = new Date(date.getTime() + offsetNow)

  // Determine previous Thursday 00:00 local
  const localMidnight = new Date(Date.UTC(nowLocal.getUTCFullYear(), nowLocal.getUTCMonth(), nowLocal.getUTCDate(), 0, 0, 0))
  const day = localMidnight.getUTCDay() // 0=Sun ... 4=Thu
  const diffToThu = (day + 3) % 7 // days back to previous Thu
  let weekStartLocal = addDays(localMidnight, -diffToThu)

  // Convert local boundaries back to UTC using a stable offset for the window (assume constant within week)
  // Compute season year and rough week number relative to season start (using same local offset logic)
  const season = seasonYear ?? getSeasonYearForDate(date)
  const seasonStartThuUTC = getSeasonStartThursday(season) // UTC Thursday after Labor Day
  const seasonStartLocal = new Date(seasonStartThuUTC.getTime() + getTimeZoneOffsetMs(seasonStartThuUTC, timeZone))

  // Clamp pre-season windows to start at the season opener (Week 1)
  if (weekStartLocal.getTime() < seasonStartLocal.getTime()) {
    weekStartLocal = new Date(seasonStartLocal.getTime())
  }
  const weekEndLocal = addDays(weekStartLocal, 6) // up to Wednesday 00:00 local (include full Tuesday)
  const start = new Date(weekStartLocal.getTime() - offsetNow)
  const end = new Date(weekEndLocal.getTime() - offsetNow)

  const diffMs = weekStartLocal.getTime() - seasonStartLocal.getTime()
  const weekIndex = diffMs < 0 ? 0 : Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
  const week = weekIndex + 1

  return { week, start, end, seasonYear: season }
}

export function isWithinWindow(when: Date, window: { start: Date; end: Date }): boolean {
  const t = when.getTime()
  return t >= window.start.getTime() && t < window.end.getTime()
}


