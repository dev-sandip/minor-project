import axios from 'axios'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

/**
 * Extracts a human friendly message from Axios / API errors.
 * Supports backend shapes like: { error }, { message }, { error, message }.
 */
export function getApiErrorMessage(err: unknown): string | null {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as unknown
    if (isRecord(data)) {
      const msg =
        (typeof data.message === 'string' && data.message) ||
        (typeof data.error === 'string' && data.error)
      if (msg) return msg
    }
    return err.message || null
  }

  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return null
}

