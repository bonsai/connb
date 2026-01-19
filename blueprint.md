# connb Blueprint (TypeScript / CLI & MCP)

## 目的

- connpass API v2 からイベント情報を検索し、CLI と MCP サーバーの両方で提供する
- 出力は「必要十分な情報を高速に」表示し、オプションで JSON 出力も可能にする
- 実装は小さな TypeScript コンポーネント（関数/クラス）に分割し、テスト可能性を高める

## 現状前提

- ワークスペース内に実装コードは未配置（`readme.md` と `task.yaml` のみ）
- ここでは “実装するならこの構成で進める” という設計図を定義する

## ユースケース

### CLI

- `connb search <query>`: キーワード検索（AND）
- `connb search --ym 202602`: 開催年月で絞り込み
- `connb search --nickname foo`: 参加者/ユーザーに紐づく検索
- `connb search --owner-nickname foo`: 主催者で検索
- `connb search --count 20 --order 2`: 件数/並び順指定
- `connb search --json`: JSON で出力

### MCP

- `search_events`: キーワード/年月/ニックネーム等を引数に取り、イベント一覧を返す
- `get_event`: event_id で単一イベント（または同等の検索）を返す

## connpass API v2 インターフェース（想定）

- Endpoint: `GET https://connpass.com/api/v2/events/`
- 主なクエリ: `keyword`, `keyword_or`, `ym`, `ymd`, `nickname`, `owner_nickname`, `series_id`, `start`, `order`, `count`
- 出力: `results_available`, `results_returned`, `results_start`, `events[]`

## 主要コンポーネント（TS）

### 1) Domain（型とルール）

- `Event`: 表示に必要な最小フィールド（title, url, startedAt, limit, accepted, waiting, place など）
- `SearchParams`: CLI/MCP から受け取る検索条件（型安全に）
- `Order`: `updated` / `started` / `new` のような列挙（API の数値/文字列に変換）
- `Result<T>`: 成功/失敗を明確に表現（例: `ok`/`err`）

### 2) Infra（HTTP と API クライアント）

- `HttpClient`: `get(url, { query, headers, timeoutMs })` を提供
- `ConnpassApiClient`:
  - `searchEvents(params: ConnpassQuery): Promise<ConnpassResponse>`
  - query 正規化（undefined を落とす、配列/単一の扱い、数値変換）
  - タイムアウト、リトライ（必要なら 429/5xx のみ限定）

### 3) Application（ユースケース）

- `SearchEventsUseCase`:
  - `execute(input: SearchParams): Promise<Event[]>`
  - `SearchParams -> ConnpassQuery` 変換
  - レスポンス `events[]` を Domain `Event[]` にマッピング
- `GetEventUseCase`（任意）:
  - `event_id` 指定の検索をラップ

### 4) Presentation（CLI 出力・フォーマット）

- `EventFormatter`:
  - `formatCompact(event: Event): string`
  - `formatJson(events: Event[]): string`
- `TablePrinter`（任意）:
  - 可変幅整形、最大文字数の切り詰め、URL の表示方針

### 5) Interfaces（CLI コマンド/引数）

- `CliArgsParser`:
  - `parse(argv): SearchParams`
  - `--ym` などの検証、help/usage 表示
- `CliCommandRouter`:
  - `search` などのサブコマンド分岐

### 6) Interfaces（MCP サーバー）

- `McpServer`:
  - tool 定義（`search_events` 等）
  - tool handler が UseCase を呼び出し、返却形式を整える
- `McpOutputMapper`:
  - MCP のレスポンスに合わせた `text`/`json` 等の整形

## ディレクトリ構成案

```
src/
  domain/
    event.ts
    searchParams.ts
    result.ts
  infra/
    httpClient.ts
    connpassApiClient.ts
  app/
    searchEventsUseCase.ts
    getEventUseCase.ts
  presentation/
    eventFormatter.ts
    tablePrinter.ts
  interfaces/
    cli/
      argsParser.ts
      router.ts
      index.ts
    mcp/
      server.ts
      tools.ts
      index.ts
  index.ts
```

## 例外/エラー設計

- 入力エラー（年月の形式など）: CLI は usage を出して終了コード 2
- ネットワーク/HTTP エラー: 簡潔なメッセージ + 終了コード 1
- API エラー: status と message を抽象化して提示（生レスポンスは標準出力に出さない）

## 出力方針

- デフォルト（compact）: 1イベント 1〜2行
  - `タイトル`
  - `URL | 開始日時 | 定員/参加/補欠`（定員未設定は `-`）
- `--json`: UseCase の Domain モデル（または API 生）を JSON で出力

## テスト方針

- `SearchEventsUseCase` は `ConnpassApiClient` をモックしてテスト
- `ConnpassApiClient` は `HttpClient` を差し替え可能にしてテスト
- `CliArgsParser` は入力→`SearchParams` の変換だけをテスト

## 実装の進め方（細かいコンポーネント順）

1. Domain 型（`Event`, `SearchParams`）を確定
2. `HttpClient` と `ConnpassApiClient` を実装（疎結合）
3. `SearchEventsUseCase` を実装し、テストで固定
4. `EventFormatter` を実装し、CLI から呼べるようにする
5. MCP サーバーの tool 定義と handler を追加

