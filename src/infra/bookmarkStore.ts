import { spawn } from "node:child_process"
import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

export type BookmarkItem = {
  id: number
  title: string
  url: string
  startedAt: string
  place?: string
}

export const loadBookmarks = async (): Promise<BookmarkItem[]> => {
  const filePath = getBookmarkFilePath()
  try {
    const raw = await fs.readFile(filePath, "utf-8")
    const parsed = JSON.parse(raw) as BookmarkItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    if (isNotFound(error)) return []
    throw error
  }
}

export const saveBookmarks = async (items: BookmarkItem[]): Promise<void> => {
  const filePath = getBookmarkFilePath()
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(items, null, 2), "utf-8")
}

export const addBookmarks = async (
  items: BookmarkItem[]
): Promise<BookmarkItem[]> => {
  if (items.length === 0) return loadBookmarks()
  const existing = await loadBookmarks()
  const merged = mergeBookmarks(existing, items)
  await saveBookmarks(merged)
  return merged
}

export const openBookmarkUrls = async (items: BookmarkItem[]): Promise<void> => {
  for (const item of items) {
    openUrl(item.url)
  }
}

const mergeBookmarks = (
  existing: BookmarkItem[],
  additions: BookmarkItem[]
): BookmarkItem[] => {
  const byId = new Map<number, BookmarkItem>()
  for (const item of existing) byId.set(item.id, item)
  for (const item of additions) byId.set(item.id, item)
  return Array.from(byId.values())
}

const getBookmarkFilePath = (): string => {
  return path.join(os.homedir(), ".connb", "bookmarks.json")
}

const openUrl = (url: string): void => {
  const platform = process.platform
  if (platform === "win32") {
    const escaped = url.replace(/'/g, "''")
    spawn(
      "powershell",
      ["-NoProfile", "-Command", `Start-Process '${escaped}'`],
      { detached: true, stdio: "ignore" }
    )
    return
  }
  if (platform === "darwin") {
    spawn("open", [url], { detached: true, stdio: "ignore" })
    return
  }
  spawn("xdg-open", [url], { detached: true, stdio: "ignore" })
}

const isNotFound = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false
  if (!("code" in error)) return false
  return (error as { code?: string }).code === "ENOENT"
}
