import { SearchEventsUseCase } from "../../app/searchEventsUseCase"
import { addBookmarks, loadBookmarks, openBookmarkUrls } from "../../infra/bookmarkStore"
import { ConnpassApiClientImpl } from "../../infra/connpassApiClient"
import { FetchHttpClient } from "../../infra/httpClient"
import { EventFormatter } from "../../presentation/eventFormatter"
import { parseArgs } from "./argsParser"

export const runCli = async (argv: string[]): Promise<number> => {
  const parsed = parseArgs(argv)
  if (parsed.command === "help") {
    printUsage()
    return 2
  }

  try {
    if (parsed.command === "bookmark") {
      const bookmarks = await loadBookmarks()
      if (parsed.action === "open") {
        await openBookmarkUrls(bookmarks)
        process.stdout.write(`Opened ${bookmarks.length} bookmarks.\n`)
        return 0
      }
      const lines = bookmarks.map((item) => `${item.title}\n${item.url}`)
      const output = lines.join("\n")
      process.stdout.write(output.endsWith("\n") ? output : `${output}\n`)
      return 0
    }

    const httpClient = new FetchHttpClient()
    const apiClient = new ConnpassApiClientImpl(httpClient)
    const useCase = new SearchEventsUseCase(apiClient)
    const formatter = new EventFormatter()

    const events = await useCase.execute(parsed.params)
    const shouldBookmark =
      parsed.params.bookmark ||
      parsed.params.thisWeek ||
      parsed.params.nextWeek ||
      parsed.params.tokyoOnly
    if (shouldBookmark) {
      const starred = events
        .filter((event) => event.starred)
        .map((event) => ({
          id: event.id,
          title: event.title,
          url: event.url,
          startedAt: event.startedAt,
          place: event.place,
        }))
      await addBookmarks(starred)
    }

    const output = parsed.params.json
      ? formatter.formatJson(events)
      : formatter.formatList(events)
    process.stdout.write(output.endsWith("\n") ? output : `${output}\n`)
    return 0
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred"
    process.stderr.write(`${message}\n`)
    return 1
  }
}

const printUsage = (): void => {
  const usage = [
    "Usage:",
    "  connb search <keyword...> [options]",
    "  connb bookmark [open]",
    "",
    "Options:",
    "  --ym <YYYYMM>          Filter by year and month",
    "  --ymd <YYYYMMDD>       Filter by date",
    "  --nickname <name>      Filter by participant nickname",
    "  --owner-nickname <name> Filter by owner nickname",
    "  --series-id <id>       Filter by series id",
    "  --start <number>       Start offset",
    "  --order <number>       Order",
    "  --count <number>       Count",
    "  --this-week           This week only",
    "  --next-week           Next week only",
    "  --tokyo               Tokyo only",
    "  --bookmark            Save starred events to bookmarks",
    "  --json                 Output JSON",
  ].join("\n")
  process.stderr.write(`${usage}\n`)
}
