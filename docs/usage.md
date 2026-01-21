# Usage

## CLI

```bash
bun run start search "Rust"
bun run start search --ym 202602
bun run start search --this-week --tokyo
bun run start search --next-week --tokyo
bun run start search --nickname foo
bun run start search --owner-nickname foo
bun run start search --count 20 --order 2
bun run start search --json
bun run start bookmark
bun run start bookmark open
```

グローバルに使いたい場合は、ローカルパッケージをリンクして `connb` を呼び出します。

```powershell
bun link
bun link connb
connb search "Rust"
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

## Taskfile

`task` コマンドは go-task の CLI です。未インストールの場合は以下で導入します。

```powershell
winget install --id Task.Task
```

導入後は次のように実行できます。

```powershell
task cli -- search "Rust"
```

## Planned

- MCP server tools
- Event detail lookup by event id
- Richer output formatting and table view
