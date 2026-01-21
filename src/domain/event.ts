export type Event = {
  id: number
  title: string
  url: string
  startedAt: string
  endedAt?: string
  limit?: number | null
  accepted: number
  waiting: number
  place?: string
  address?: string
  catch?: string
  starred?: boolean
}
