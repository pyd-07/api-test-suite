import ora, { type Ora } from "ora"

/**
 * Thin wrapper around `ora` for spinner management.
 * 
 * - Auto-detects non-TTY (CI) environments and degrades gracefully.
 * - Must be stopped before any console output to prevent interleaving.
 */

const isCI = !process.stdout.isTTY

export function createSpinner(text: string): Ora {
    return ora({
        text,
        // In CI, ora automatically falls back to a static log line
        // instead of an animated spinner, preventing ANSI spam.
        isSilent: false,
        discardStdin: !isCI,
    })
}
