connb (CLI & MCP)
connb は、connpass API v2 を活用してエンジニア向けのイベント情報を効率よく取得するためのツールです。 ターミナルで動作する CLI と、AI エージェントがイベント情報を参照できるようにする MCP (Model Context Protocol) サーバー の両機能を提供します。

利用 API
本ツールは以下の API を使用しています。 https://connpass.com/about/api/v2/

主な機能
イベント検索: キーワード、開催年月、ニックネームなどによる絞り込み。

MCP 連携: Claude や Cursor などの AI に「今週末の勉強会を教えて」と聞くだけで、connpass の最新データを取得させることが可能。

高速な出力: 必要な情報（タイトル、URL、定員）をコンパクトに表示。

インストール
Bash
# リポジトリのクローン
git clone https://github.com/bonsai/connb.git
cd connb

# 依存関係のインストール
npm install
# ビルド
npm run build
使い方
1. CLI (connb)
直接コマンドラインから検索します。

Bash
# キーワード「Rust」で検索
connb search "Rust"

# 特定の年月を指定して検索
connb search --ym 202602
2. MCP サーバー
AI エージェントと連携させるための設定です。

Claude Desktop 設定
claude_desktop_config.json に以下の設定を追加してください。

JSON
{
  "mcpServers": {
    "connb": {
      "command": "node",
      "args": ["/Users/bonsai/path/to/connb/dist/index.js"]
    }
  }
}
開発環境
言語: TypeScript

作者: bonsai (https://github.com/bonsai)

ライセンス: MIT
