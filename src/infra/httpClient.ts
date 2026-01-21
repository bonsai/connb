export type HttpQueryValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>

export type HttpGetOptions = {
  query?: Record<string, HttpQueryValue | null | undefined>
  headers?: Record<string, string>
  timeoutMs?: number
}

export interface HttpClient {
  get<T>(url: string, options?: HttpGetOptions): Promise<T>
}

export class FetchHttpClient implements HttpClient {
  async get<T>(url: string, options: HttpGetOptions = {}): Promise<T> {
    const finalUrl = buildUrl(url, options.query)
    const controller = options.timeoutMs ? new AbortController() : undefined
    const timeoutId = options.timeoutMs
      ? setTimeout(() => controller?.abort(), options.timeoutMs)
      : undefined

    try {
      const response = await fetch(finalUrl, {
        method: "GET",
        headers: options.headers,
        signal: controller?.signal,
      })

      if (!response.ok) {
        const text = await response.text().catch(() => "")
        const suffix = text ? `: ${text}` : ""
        throw new Error(`HTTP ${response.status}${suffix}`)
      }

      return (await response.json()) as T
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }
}

const buildUrl = (
  url: string,
  query: Record<string, HttpQueryValue | null | undefined> | undefined
): string => {
  if (!query || Object.keys(query).length === 0) return url
  const result = new URL(url)

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        result.searchParams.append(key, String(item))
      }
      continue
    }
    result.searchParams.append(key, String(value))
  }

  return result.toString()
}
