# Usage

## CLI

```bash
connb search "Rust"
connb search --ym 202602
connb search --this-week --tokyo
connb search --next-week --tokyo
connb search --nickname foo
connb search --owner-nickname foo
connb search --count 20 --order 2
connb search --json
connb bookmark
connb bookmark open
```

## Auth

connpass API v2 が認証を求める場合は、環境変数で API キーを設定してください。

```powershell
$env:CONNPASS_API_KEY = "YOUR_API_KEY"
```

任意のヘッダー名やスキームを指定できます。

```powershell
$env:CONNPASS_API_KEY_HEADER = "X-API-KEY"
$env:CONNPASS_API_AUTH_SCHEME = "Bearer"
```

## Planned

- MCP server tools
- Event detail lookup by event id
- Richer output formatting and table view
