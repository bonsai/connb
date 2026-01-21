import { HttpClient, HttpGetOptions, HttpQueryValue } from "./httpClient"

export type ConnpassEvent = {
  event_id: number
  title: string
  event_url: string
  started_at: string
  ended_at?: string
  limit?: number | null
  accepted?: number
  waiting?: number
  place?: string
  address?: string
  catch?: string
}

export type ConnpassResponse = {
  results_available: number
  results_returned: number
  results_start: number
  events: ConnpassEvent[]
}

export type ConnpassQuery = Record<string, HttpQueryValue>

export interface ConnpassApiClient {
  searchEvents(params: ConnpassQuery): Promise<ConnpassResponse>
}

export class ConnpassApiClientImpl implements ConnpassApiClient {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly baseUrl = "https://connpass.com/api/v2/events/",
    private readonly defaultOptions: Omit<HttpGetOptions, "query"> = {
      timeoutMs: 10000,
      headers: buildAuthHeaders(),
    }
  ) {}

  async searchEvents(params: ConnpassQuery): Promise<ConnpassResponse> {
    const query = normalizeQuery(params)
    try {
      return await this.httpClient.get<ConnpassResponse>(this.baseUrl, {
        ...this.defaultOptions,
        query,
      })
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("HTTP 401")) {
        throw new Error(
          `${error.message}. Set CONNPASS_API_KEY or CONNPASS_API_TOKEN.`
        )
      }
      throw error
    }
  }
}

const buildAuthHeaders = (): Record<string, string> | undefined => {
  const rawToken =
    process.env.CONNPASS_API_KEY ?? process.env.CONNPASS_API_TOKEN ?? ""
  const token = rawToken.trim()
  if (!token) return undefined
  const headerName = process.env.CONNPASS_API_KEY_HEADER?.trim()
  const scheme = process.env.CONNPASS_API_AUTH_SCHEME?.trim() || "Bearer"
  if (headerName) {
    if (headerName.toLowerCase() === "authorization") {
      const value = token.toLowerCase().startsWith("bearer ")
        ? token
        : `${scheme} ${token}`
      return { [headerName]: value }
    }
    return { [headerName]: token }
  }
  const authValue = token.toLowerCase().startsWith("bearer ")
    ? token
    : `${scheme} ${token}`
  return {
    Authorization: authValue,
    "X-API-KEY": token,
  }
}

const normalizeQuery = (
  params: Record<string, HttpQueryValue>
): Record<string, HttpQueryValue> => {
  const result: Record<string, HttpQueryValue> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value) && value.length === 0) continue
    if (typeof value === "string" && value.trim() === "") continue
    result[key] = value
  }
  return result
}
