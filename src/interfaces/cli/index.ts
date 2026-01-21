import { runCli } from "./router"

export const main = async (argv: string[]): Promise<void> => {
  const exitCode = await runCli(argv)
  process.exitCode = exitCode
}
