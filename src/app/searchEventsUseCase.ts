import { Event } from "../domain/event"
import { SearchParams } from "../domain/searchParams"
import {
  ConnpassApiClient,
  ConnpassEvent,
  ConnpassQuery,
} from "../infra/connpassApiClient"

export class SearchEventsUseCase {
  constructor(private readonly apiClient: ConnpassApiClient) {}

  async execute(input: SearchParams): Promise<Event[]> {
    const query = toConnpassQuery(input)
    const response = await this.apiClient.searchEvents(query)
    const events = response.events.map(mapEvent)
    const filtered = input.tokyoOnly ? events.filter(isTokyoEvent) : events
    return filtered
  }
}

const toConnpassQuery = (input: SearchParams): ConnpassQuery => {
  const keyword =
    input.keyword && input.keyword.length > 0
      ? input.keyword.join(" ")
      : undefined

  const ymdList = buildYmdList(input)

  const query: ConnpassQuery = {}
  if (keyword) query.keyword = keyword
  if (input.ym) query.ym = input.ym
  if (ymdList.length > 0) {
    query.ymd = ymdList
  } else if (input.ymd) {
    query.ymd = input.ymd
  }
  if (input.nickname) query.nickname = input.nickname
  if (input.ownerNickname) query.owner_nickname = input.ownerNickname
  if (input.seriesId !== undefined) query.series_id = input.seriesId
  if (input.start !== undefined) query.start = input.start
  if (input.order !== undefined) query.order = input.order
  if (input.count !== undefined) query.count = input.count
  if (input.eventId !== undefined) query.event_id = input.eventId
  return query
}

const mapEvent = (event: ConnpassEvent): Event => ({
  id: event.event_id,
  title: event.title,
  url: event.event_url,
  startedAt: event.started_at,
  endedAt: event.ended_at,
  limit: event.limit ?? null,
  accepted: event.accepted ?? 0,
  waiting: event.waiting ?? 0,
  place: event.place,
  address: event.address,
  catch: event.catch,
  starred: hasStarInTitle(event.title),
})

const isTokyoEvent = (event: Event): boolean => {
  const place = event.place ?? ""
  const address = event.address ?? ""
  return place.includes("東京") || address.includes("東京")
}

const buildYmdList = (input: SearchParams): string[] => {
  const values: string[] = []
  if (input.ymd) values.push(input.ymd)
  if (input.thisWeek) values.push(...buildWeekDates(0))
  if (input.nextWeek) values.push(...buildWeekDates(1))
  return Array.from(new Set(values))
}

const buildWeekDates = (offsetWeeks: number): string[] => {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = date.getDay()
  const diff = (day + 6) % 7
  date.setDate(date.getDate() - diff + offsetWeeks * 7)
  const dates: string[] = []
  for (let i = 0; i < 7; i += 1) {
    const current = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i)
    dates.push(formatYmd(current))
  }
  return dates
}

const formatYmd = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

const hasStarInTitle = (title: string): boolean => {
  const lowered = title.toLowerCase()
  return lowered.includes("star") || title.includes("★") || title.includes("☆")
}
