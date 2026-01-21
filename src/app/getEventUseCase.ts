import { Event } from "../domain/event"
import {
  ConnpassApiClient,
  ConnpassEvent,
} from "../infra/connpassApiClient"

export class GetEventUseCase {
  constructor(private readonly apiClient: ConnpassApiClient) {}

  async execute(eventId: number): Promise<Event | null> {
    const response = await this.apiClient.searchEvents({ event_id: eventId })
    if (response.events.length === 0) return null
    return mapEvent(response.events[0])
  }
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

const hasStarInTitle = (title: string): boolean => {
  const lowered = title.toLowerCase()
  return lowered.includes("star") || title.includes("★") || title.includes("☆")
}
