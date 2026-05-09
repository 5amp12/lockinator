import { useRef, useState } from 'react'

export function useWebcam() {
  const videoRef  = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)

  async function startWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    streamRef.current = stream
    videoRef.current.srcObject = stream
    await videoRef.current.play()
    setReady(true)
  }

  function stopWebcam() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    videoRef.current.srcObject = null
    setReady(false)
  }

  return { videoRef, ready, startWebcam, stopWebcam }
}