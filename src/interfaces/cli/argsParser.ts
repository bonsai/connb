import { Order, SearchParams } from "../../domain/searchParams"

export type ParsedCommand =
  | { command: "search"; params: SearchParams }
  | { command: "bookmark"; action: "open" | "list" }
  | { command: "help" }

export const parseArgs = (argv: string[]): ParsedCommand => {
  if (argv.length === 0) return { command: "help" }
  const [command, ...rest] = argv

  if (command === "bookmark") {
    const action = rest[0] === "open" ? "open" : "list"
    return { command: "bookmark", action }
  }

  if (command !== "search") return { command: "help" }

  const params: SearchParams = {}
  const keywords: string[] = []

  for (let i = 0; i < rest.length; i += 1) {
    const value = rest[i]
    if (!value.startsWith("--")) {
      keywords.push(value)
      continue
    }

    if (value === "--json") {
      params.json = true
      continue
    }

    if (value === "--this-week") {
      params.thisWeek = true
      continue
    }

    if (value === "--next-week") {
      params.nextWeek = true
      continue
    }

    if (value === "--tokyo") {
      params.tokyoOnly = true
      continue
    }

    if (value === "--bookmark") {
      params.bookmark = true
      continue
    }

    const next = rest[i + 1]
    if (!next || next.startsWith("--")) continue

    switch (value) {
      case "--ym":
        params.ym = next
        i += 1
        break
      case "--ymd":
        params.ymd = next
        i += 1
        break
      case "--nickname":
        params.nickname = next
        i += 1
        break
      case "--owner-nickname":
        params.ownerNickname = next
        i += 1
        break
      case "--series-id":
        params.seriesId = toNumber(next)
        i += 1
        break
      case "--start":
        params.start = toNumber(next)
        i += 1
        break
      case "--order":
        params.order = toOrder(next)
        i += 1
        break
      case "--count":
        params.count = toNumber(next)
        i += 1
        break
      case "--event-id":
        params.eventId = toNumber(next)
        i += 1
        break
      default:
        break
    }
  }

  if (keywords.length > 0) params.keyword = keywords

  return { command: "search", params }
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return parsed
}

const toOrder = (value: string): Order => {
  const parsed = Number(value)
  if (!Number.isNaN(parsed)) return parsed
  return value as Order
}
