# connb (CLI & MCP)

connb は、connpass API v2 を活用してエンジニア向けのイベント情報を効率よく取得するためのツールです。ターミナルで動作する CLI と、AI エージェントがイベント情報を参照できるようにする MCP (Model Context Protocol) サーバーの両機能を提供します。

## 利用 API

本ツールは以下の API を使用しています。

- https://connpass.com/about/api/v2/

## 主な機能

- イベント検索: キーワード、開催年月、ニックネームなどによる絞り込み
- MCP 連携: Claude や Cursor などの AI に「今週末の勉強会を教えて」と聞くだけで、connpass の最新データを取得可能
- 高速な出力: 必要な情報（タイトル、URL、定員）をコンパクトに表示

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/bonsai/connb.git
cd connb

# 依存関係のインストール
bun install

# ビルド
bun run build
```

## 使い方

### 1. CLI (connb)

直接コマンドラインから検索します。

```bash
# キーワード「Rust」で検索
bun run start search "Rust"

# 特定の年月を指定して検索
bun run start search --ym 202602

# 利用可能なオプションを確認
bun run start search --help
```

詳細は docs/usage.md を参照してください。

グローバルに使いたい場合は、ローカルパッケージをリンクして `connb` を呼び出します。

```powershell
bun link
bun link connb
connb search "Rust"
```

### 認証

connpass API v2 が認証を求める場合は、環境変数で API キーを設定してください。

```powershell
$env:CONNPASS_API_KEY = "YOUR_API_KEY"
```

任意のヘッダー名やスキームを指定できます。

```powershell
$env:CONNPASS_API_KEY_HEADER = "X-API-KEY"
$env:CONNPASS_API_AUTH_SCHEME = "Bearer"
```

### Taskfile

`task` コマンドは go-task の CLI です。未インストールの場合は以下で導入します。

```powershell
winget install --id Task.Task
```

導入後は次のように実行できます。

```powershell
task cli -- search "Rust"
```

### 2. MCP サーバー

AI エージェントと連携させるための設定です。事前に `bun run build` を実行して `dist/index.js` が生成されている状態にしてください。

#### Claude Desktop 設定

`claude_desktop_config.json` に以下の設定を追加してください。

```json
{
  "mcpServers": {
    "connb": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH_TO_CONNB>/dist/index.js"]
    }
  }
}
```

パス例:

- macOS / Linux: `/Users/bonsai/path/to/connb/dist/index.js`
- Windows: `C:/Users/bonsai/path/to/connb/dist/index.js`

## 開発環境

- 言語: TypeScript

## ドキュメント

- docs/README.md

## 作者

- bonsai: https://github.com/bonsai

## ライセンス

- MIT
