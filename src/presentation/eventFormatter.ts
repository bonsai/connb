import { Event } from "../domain/event"

export class EventFormatter {
  formatCompact(event: Event): string {
    const limit =
      event.limit === undefined || event.limit === null ? "-" : String(event.limit)
    const accepted = event.accepted ?? 0
    const waiting = event.waiting ?? 0
    const startedAt = formatDateTime(event.startedAt)
    const place = event.place ? ` | ${event.place}` : ""
    const line1 = formatTitle(event)
    const line2 = `${event.url} | ${startedAt} | ${limit}/${accepted}/${waiting}${place}`
    return `${line1}\n${line2}`
  }

  formatList(events: Event[]): string {
    return events.map((event) => this.formatCompact(event)).join("\n")
  }

  formatJson(events: Event[]): string {
    return JSON.stringify(events, null, 2)
  }
}

const formatDateTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const formatTitle = (event: Event): string => {
  if (!event.starred) return event.title
  if (event.title.includes("★") || event.title.includes("☆")) return event.title
  return `★ ${event.title}`
}
