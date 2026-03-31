import { useEffect, useRef, useState } from 'react'
import type { Vehicle } from '@/lib/api/vehicle'

type StreamEventName = 'init' | 'vehicle'

function parseVehicleList(json: string): Vehicle[] {
  const parsed = JSON.parse(json) as unknown
  if (!Array.isArray(parsed)) return []
  return parsed as Vehicle[]
}

function parseVehicle(json: string): Vehicle | null {
  const parsed = JSON.parse(json) as unknown
  if (!parsed || typeof parsed !== 'object') return null
  return parsed as Vehicle
}

export function useVehicleStream(options?: {
  /** Defaults to `/api/vehicles/stream` */
  url?: string
  /** Keep last N vehicles in memory. Default 100 */
  max?: number
}) {
  const url =
    options?.url ??
    `${(import.meta.env.VITE_BASE_URL ?? '').replace(/\/$/, '')}/api/vehicles/stream`
  const max = options?.max ?? 100
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [status, setStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'error'
  >('idle')
  const reconnectAttemptRef = useRef(0)

  useEffect(() => {
    let es: EventSource | null = null
    let reconnectTimer: number | null = null
    let closedByEffect = false

    const connect = () => {
      if (closedByEffect) return
      setStatus('connecting')
      es?.close()
      es = new EventSource(url)

      const onInit = (e: MessageEvent<string>) => {
        setVehicles(parseVehicleList(e.data))
        setStatus('connected')
        reconnectAttemptRef.current = 0
      }

      const onVehicle = (e: MessageEvent<string>) => {
        const incoming = parseVehicle(e.data)
        if (!incoming) return
        setVehicles((prev) => {
          const idx = prev.findIndex((v) => v.id === incoming.id)
          if (idx !== -1) {
            const next = [...prev]
            next[idx] = incoming
            return next
          }
          return [incoming, ...prev].slice(0, max)
        })
      }

      es.addEventListener('init' satisfies StreamEventName, onInit as any)
      es.addEventListener('vehicle' satisfies StreamEventName, onVehicle as any)

      es.onerror = () => {
        if (closedByEffect) return
        setStatus('error')

        // Let the browser attempt reconnect, but some environments/proxies
        // require recreating EventSource. Do a simple capped backoff.
        es?.close()
        const attempt = (reconnectAttemptRef.current += 1)
        const delay = Math.min(30_000, 500 * 2 ** Math.min(attempt, 6))
        if (reconnectTimer) window.clearTimeout(reconnectTimer)
        reconnectTimer = window.setTimeout(connect, delay)
      }
    }

    try {
      connect()
    } catch {
      setStatus('error')
    }

    return () => {
      closedByEffect = true
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      es?.close()
      setStatus('idle')
    }
  }, [url, max])

  return { vehicles, status }
}

