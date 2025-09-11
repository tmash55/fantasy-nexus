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

// Manual week mapping for 2025 season - easier to control than complex date math
const WEEK_MAPPINGS_2025 = [
  { week: 1, start: '2025-09-05', end: '2025-09-10' }, // Thu Sep 5 - Tue Sep 10
  { week: 2, start: '2025-09-11', end: '2025-09-17' }, // Wed Sep 11 - Tue Sep 17
  { week: 3, start: '2025-09-18', end: '2025-09-24' }, // Wed Sep 18 - Tue Sep 24
  { week: 4, start: '2025-09-25', end: '2025-10-01' }, // Wed Sep 25 - Tue Oct 1
  { week: 5, start: '2025-10-02', end: '2025-10-08' }, // Wed Oct 2 - Tue Oct 8
  { week: 6, start: '2025-10-09', end: '2025-10-15' }, // Wed Oct 9 - Tue Oct 15
  { week: 7, start: '2025-10-16', end: '2025-10-22' }, // Wed Oct 16 - Tue Oct 22
  { week: 8, start: '2025-10-23', end: '2025-10-29' }, // Wed Oct 23 - Tue Oct 29
  { week: 9, start: '2025-10-30', end: '2025-11-05' }, // Wed Oct 30 - Tue Nov 5
  { week: 10, start: '2025-11-06', end: '2025-11-12' }, // Wed Nov 6 - Tue Nov 12
  { week: 11, start: '2025-11-13', end: '2025-11-19' }, // Wed Nov 13 - Tue Nov 19
  { week: 12, start: '2025-11-20', end: '2025-11-26' }, // Wed Nov 20 - Tue Nov 26
  { week: 13, start: '2025-11-27', end: '2025-12-03' }, // Wed Nov 27 - Tue Dec 3
  { week: 14, start: '2025-12-04', end: '2025-12-10' }, // Wed Dec 4 - Tue Dec 10
  { week: 15, start: '2025-12-11', end: '2025-12-17' }, // Wed Dec 11 - Tue Dec 17
  { week: 16, start: '2025-12-18', end: '2025-12-24' }, // Wed Dec 18 - Tue Dec 24
  { week: 17, start: '2025-12-25', end: '2025-12-31' }, // Wed Dec 25 - Tue Dec 31
  { week: 18, start: '2026-01-01', end: '2026-01-07' }, // Wed Jan 1 - Tue Jan 7
]

function getWeekFromMapping(date: Date, seasonYear: number): { week: number; start: Date; end: Date } | null {
  if (seasonYear !== 2025) return null // Only have mappings for 2025 season
  
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
  
  for (const mapping of WEEK_MAPPINGS_2025) {
    if (dateStr >= mapping.start && dateStr <= mapping.end) {
      return {
        week: mapping.week,
        start: new Date(mapping.start + 'T00:00:00.000Z'),
        end: new Date(mapping.end + 'T23:59:59.999Z')
      }
    }
  }
  
  return null
}

export function getWeekWindowForDate(date: Date, seasonYear?: number, timeZone: string = DEFAULT_TZ): WeekWindow {
  const season = seasonYear ?? getSeasonYearForDate(date)
  
  // Try manual mapping first
  const mapping = getWeekFromMapping(date, season)
  if (mapping) {
    console.log(`[getWeekWindowForDate] using manual mapping: week=${mapping.week}, season=${season}`)
    return { week: mapping.week, start: mapping.start, end: mapping.end, seasonYear: season }
  }
  
  // Fallback to original logic for other seasons
  console.log(`[getWeekWindowForDate] falling back to calculated logic for season ${season}`)
  
  // Work in local (zone) time by shifting UTC by the zone offset at 'now'
  const offsetNow = getTimeZoneOffsetMs(date, timeZone)
  const nowLocal = new Date(date.getTime() + offsetNow)

  // Determine previous Thursday 00:00 local, but advance to next week if it's Wednesday morning
  const localMidnight = new Date(Date.UTC(nowLocal.getUTCFullYear(), nowLocal.getUTCMonth(), nowLocal.getUTCDate(), 0, 0, 0))
  const day = localMidnight.getUTCDay() // 0=Sun ... 4=Thu, 3=Wed
  const hour = nowLocal.getUTCHours()
  
  // If it's Wednesday (day 3) and we're in the morning (before noon), advance to next week
  const advanceWeek = day === 3 && hour < 12
  
  const diffToThu = (day + 3) % 7 // days back to previous Thu
  let weekStartLocal = addDays(localMidnight, -diffToThu)
  
  // If advancing week, move to next Thursday
  if (advanceWeek) {
    weekStartLocal = addDays(weekStartLocal, 7)
  }

  // Convert local boundaries back to UTC using a stable offset for the window (assume constant within week)
  // Compute season year and rough week number relative to season start (using same local offset logic)
  const seasonStartThuUTC = getSeasonStartThursday(season) // UTC Thursday after Labor Day
  const seasonStartLocal = new Date(seasonStartThuUTC.getTime() + getTimeZoneOffsetMs(seasonStartThuUTC, timeZone))

  console.log(`[getWeekWindowForDate] input=${date.toISOString()}, offsetNow=${offsetNow}, nowLocal=${nowLocal.toISOString()}, day=${day}, hour=${hour}, advanceWeek=${advanceWeek}, seasonStartLocal=${seasonStartLocal.toISOString()}, weekStartLocal=${weekStartLocal.toISOString()}`)

  // Clamp pre-season windows to start at the season opener (Week 1)
  if (weekStartLocal.getTime() < seasonStartLocal.getTime()) {
    weekStartLocal = new Date(seasonStartLocal.getTime())
    console.log(`[getWeekWindowForDate] clamped weekStartLocal to seasonStart: ${weekStartLocal.toISOString()}`)
  }
  const weekEndLocal = addDays(weekStartLocal, 6) // up to Wednesday 00:00 local (include full Tuesday)
  const start = new Date(weekStartLocal.getTime() - offsetNow)
  const end = new Date(weekEndLocal.getTime() - offsetNow)

  const diffMs = weekStartLocal.getTime() - seasonStartLocal.getTime()
  const weekIndex = diffMs < 0 ? 0 : Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))
  const week = weekIndex + 1

  console.log(`[getWeekWindowForDate] diffMs=${diffMs}, weekIndex=${weekIndex}, week=${week}, season=${season}`)

  return { week, start, end, seasonYear: season }
}

export function isWithinWindow(when: Date, window: { start: Date; end: Date }): boolean {
  const t = when.getTime()
  return t >= window.start.getTime() && t < window.end.getTime()
}


