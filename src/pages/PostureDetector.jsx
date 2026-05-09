import { useRef, useState } from 'react'
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

function PostureDetector() {
  const videoRef          = useRef(null)
  const canvasRef         = useRef(null)
  const streamRef         = useRef(null)
  const rafRef            = useRef(null)
  const poseLandmarkerRef = useRef(null)
  const postureRef = useRef(true)

  const [running, setRunning] = useState(false)
  const [tilt, setTilt] = useState(null)
  const [posture, setPosture] = useState(true)

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    streamRef.current = stream
    videoRef.current.srcObject = stream
    await videoRef.current.play()

    const { videoWidth: w, videoHeight: h } = videoRef.current
    canvasRef.current.width  = w
    canvasRef.current.height = h

    // Load model FIRST, then start the loop
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    )
    poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task' },
      runningMode: 'VIDEO',
      numPoses: 1,
    })

    setRunning(true)
    rafRef.current = requestAnimationFrame(detect)  // ← start loop after model ready
  }

  async function detect() { 
    const video  = videoRef.current
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const result = await poseLandmarkerRef.current.detectForVideo(video, performance.now())  // ← ref
    if (result.landmarks[0]) {
      const landmarks = result.landmarks[0]
      drawOverlay(ctx, landmarks, canvas.width, canvas.height)
      if (postureRef.current){
        computePosture(landmarks);
      }
      
    }

    rafRef.current = requestAnimationFrame(detect)
  }

  //setting skeletion lines overlay
  function drawOverlay(ctx, landmarks, canvasW, canvasH) {
    landmarks.forEach(pt => {
        ctx.beginPath()
        ctx.arc(pt.x * canvasW, pt.y * canvasH, 5, 0, 2 * Math.PI)
        ctx.fillStyle = 'red'
        ctx.fill()
    })
  } 

  function computePosture(landmarks) {
    const nose = landmarks[0]
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]

    const averageShoulderZ = (leftShoulder.z + rightShoulder.z) / 2;
    const headz = nose.z;


    const diff = (averageShoulderZ - headz) / Math.abs(averageShoulderZ)  // positive = head is closer than shoulders = slouching
    console.log(diff);
    if (diff < 1.5) {      
        console.log("Slouching!!")
    }
  }


  function stop() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    videoRef.current.srcObject = null
    setRunning(false)
    setTilt(null)   
  }

  return (
    <div>
      <canvas ref={canvasRef} />
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
      <p>Head tilt: {tilt !== null ? `${tilt}°` : '–'}</p>
      <button onClick={start} disabled={running}>Start</button>
      <button onClick={stop}  disabled={!running}>Stop</button>
      {/* <label class="switch"> */}
      <input type="checkbox" checked={posture} onChange={() => {
            postureRef.current = !postureRef.current
            setPosture(p => !p)
       }} />
        

    </div>
  )
}

export default PostureDetector