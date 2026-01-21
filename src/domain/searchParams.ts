export type Order = number | "updated" | "started" | "new"

export type SearchParams = {
  keyword?: string[]
  ym?: string
  ymd?: string
  nickname?: string
  ownerNickname?: string
  seriesId?: number
  start?: number
  order?: Order
  count?: number
  eventId?: number
  thisWeek?: boolean
  nextWeek?: boolean
  tokyoOnly?: boolean
  bookmark?: boolean
  json?: boolean
}
