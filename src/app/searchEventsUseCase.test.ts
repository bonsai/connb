import assert from "node:assert/strict"
import { test } from "node:test"
import { SearchEventsUseCase } from "./searchEventsUseCase"
import { ConnpassApiClient } from "../infra/connpassApiClient"

test("SearchEventsUseCase maps query and response", async () => {
  let receivedQuery: {
    keyword?: string
    ym?: string
    count?: number
  } = {}

  const client: ConnpassApiClient = {
    async searchEvents(query) {
      receivedQuery = query
      return {
        results_available: 2,
        results_returned: 2,
        results_start: 1,
        events: [
          {
            event_id: 10,
            title: "Star Meetup",
            event_url: "https://connpass.com/event/10/",
            started_at: "2026-02-01T19:00:00+09:00",
            ended_at: "2026-02-01T21:00:00+09:00",
            limit: 50,
            accepted: 20,
            waiting: 1,
            place: "東京",
            address: "千代田区",
            catch: "Rust lovers",
          },
          {
            event_id: 11,
            title: "Other Meetup",
            event_url: "https://connpass.com/event/11/",
            started_at: "2026-02-02T19:00:00+09:00",
            ended_at: "2026-02-02T21:00:00+09:00",
            limit: 40,
            accepted: 10,
            waiting: 0,
            place: "Osaka",
            address: "Osaka",
            catch: "Other",
          },
        ],
      }
    },
  }

  const useCase = new SearchEventsUseCase(client)
  const events = await useCase.execute({
    keyword: ["Rust", "LT"],
    ym: "202602",
    count: 10,
    tokyoOnly: true,
  })

  assert.equal(receivedQuery.keyword, "Rust LT")
  assert.equal(receivedQuery.ym, "202602")
  assert.equal(receivedQuery.count, 10)
  assert.equal(events.length, 1)
  assert.equal(events[0].id, 10)
  assert.equal(events[0].title, "Star Meetup")
  assert.equal(events[0].url, "https://connpass.com/event/10/")
  assert.equal(events[0].place, "東京")
  assert.equal(events[0].starred, true)
})
