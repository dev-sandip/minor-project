import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createVehicleEntry, exitVehicle } from '@/lib/api/vehicle'

export const Route = createFileRoute('/simulation')({
  component: SimulationPage,
})

function SimulationPage() {
  const queryClient = useQueryClient()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const entryMutation = useMutation({
    mutationFn: createVehicleEntry,
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Entry recorded', {
        description: `Plate ${vehicle.licensePlate} entered at ${new Date(
          vehicle.entryTime,
        ).toLocaleTimeString()}`,
      })
    },
    onError: (err: unknown) => {
      toast.error('Entry failed', {
        description:
          err instanceof Error ? err.message : 'Could not record entry.',
      })
    },
  })

  const exitMutation = useMutation({
    mutationFn: exitVehicle,
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Exit recorded', {
        description: `Plate ${vehicle.licensePlate} charged Rs. ${
          vehicle.totalAmount ?? '0.00'
        }`,
      })
    },
    onError: (err: unknown) => {
      toast.error('Exit failed', {
        description:
          err instanceof Error ? err.message : 'Could not record exit.',
      })
    },
  })

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  const startCamera = async () => {
    try {
      setCameraError(null)
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      setStream(media)
      if (videoRef.current) {
        videoRef.current.srcObject = media
        await videoRef.current.play()
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to access camera'
      setCameraError(message)
      toast.error('Camera error', { description: message })
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      toast.message('Camera stopped')
    }
    setStream(null)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const captureFrameAsFile = async (): Promise<File | null> => {
    if (!videoRef.current || !canvasRef.current) return null
    const video = videoRef.current
    const canvas = canvasRef.current
    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) return null
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, width, height)
    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(null)
          const file = new File([blob], `plate-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })
          resolve(file)
        },
        'image/jpeg',
        0.9,
      )
    })
  }

  const handleEntrySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input?.files?.length) return
    const file = input.files[0]
    await entryMutation.mutateAsync(file)
    form.reset()
  }

  const handleExitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input?.files?.length) return
    const file = input.files[0]
    await exitMutation.mutateAsync(file)
    form.reset()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-medium text-foreground">Simulation lab</h1>
        <p className="text-xs text-muted-foreground">
          Simulate real-time parking by capturing Nepali license plate images for entry
          and exit. Camera integration will plug into the same flow later.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Simulate entry</CardTitle>
            <CardDescription>
              In production a camera feed will capture a plate image here. For now,
              upload a test image to record an entry.
            </CardDescription>
          </CardHeader>
            <CardContent>
            <form onSubmit={handleEntrySubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="sim-entry-image">Entry image</Label>
                <Input
                  id="sim-entry-image"
                  type="file"
                  accept="image/*"
                  required
                  className="text-xs"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={stream ? stopCamera : startCamera}
                >
                  {stream ? 'Stop camera' : 'Open camera'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={entryMutation.isPending || !stream}
                  onClick={async () => {
                    const file = await captureFrameAsFile()
                    if (!file) return
                    await entryMutation.mutateAsync(file)
                  }}
                >
                  {entryMutation.isPending ? 'Simulating…' : 'Capture & simulate'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Simulate exit</CardTitle>
            <CardDescription>
              Use another capture of the same vehicle to simulate exit and billing.
            </CardDescription>
          </CardHeader>
            <CardContent>
            <form onSubmit={handleExitSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="sim-exit-image">Exit image</Label>
                <Input
                  id="sim-exit-image"
                  type="file"
                  accept="image/*"
                  required
                  className="text-xs"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  disabled={exitMutation.isPending || !stream}
                  onClick={async () => {
                    const file = await captureFrameAsFile()
                    if (!file) return
                    await exitMutation.mutateAsync(file)
                  }}
                >
                  {exitMutation.isPending ? 'Simulating…' : 'Capture & simulate'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Live camera</CardTitle>
            <CardDescription>
              This preview uses your device camera. Capture frames to simulate entry and exit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {cameraError && (
              <p className="text-[11px] text-destructive">{cameraError}</p>
            )}
            <div className="flex justify-center">
              <video
                ref={videoRef}
                className="w-full max-w-md rounded border border-border bg-black"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

