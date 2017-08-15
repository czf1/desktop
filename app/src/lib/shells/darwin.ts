import { spawn } from 'child_process'
import { assertNever } from '../fatal-error'

const appPath: (bundleId: string) => Promise<string> = require('app-path')

export enum Shell {
  Terminal = 'Terminal',
  Hyper = 'Hyper',
  iTerm2 = 'iTerm2',
}

export const Default = Shell.Terminal

export function parse(label: string): Shell {
  if (label === Shell.Terminal) {
    return Shell.Terminal
  }

  if (label === Shell.Hyper) {
    return Shell.Hyper
  }

  if (label === Shell.iTerm2) {
    return Shell.iTerm2
  }

  return Default
}

function getBundleID(shell: Shell): string {
  switch (shell) {
    case Shell.Terminal:
      return 'com.apple.Terminal'
    case Shell.iTerm2:
      return 'com.googlecode.iterm2'
    case Shell.Hyper:
      return 'co.zeit.hyper'
    default:
      return assertNever(shell, `Unknown shell: ${shell}`)
  }
}

async function isShellInstalled(shell: Shell): Promise<boolean> {
  const bundleId = getBundleID(shell)
  try {
    const path = await appPath(bundleId)
    return path.length > 0
  } catch (e) {
    // `appPath` will raise an error if it cannot find the program.
  }

  return false
}

export async function getAvailableShells(): Promise<ReadonlyArray<Shell>> {
  const [
    terminalInstalled,
    hyperInstalled,
    iTermInstalled,
  ] = await Promise.all([
    isShellInstalled(Shell.Terminal),
    isShellInstalled(Shell.Hyper),
    isShellInstalled(Shell.iTerm2),
  ])

  const shells: Array<Shell> = []
  if (terminalInstalled) {
    shells.push(Shell.Terminal)
  }

  if (hyperInstalled) {
    shells.push(Shell.Hyper)
  }

  if (iTermInstalled) {
    shells.push(Shell.iTerm2)
  }

  return shells
}

export async function launch(shell: Shell, path: string): Promise<void> {
  const bundleID = getBundleID(shell)
  const commandArgs = ['-b', bundleID, path]
  await spawn('open', commandArgs, { shell: true })
}
