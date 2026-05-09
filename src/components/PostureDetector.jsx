import { useEffect, useRef, useState } from 'react'
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import shared from './shared.module.css'

function PostureDetector({ videoRef, ready, enabled }) {
  const canvasRef         = useRef(null)
  const rafRef            = useRef(null)
  const poseLandmarkerRef = useRef(null)
  const postureRef = useRef(true)
  const badPostureStart = useRef(null);
  const numBadPosture = useRef(0)
  const enabledRef = useRef(enabled)

  const [running, setRunning] = useState(false)
  const [tilt, setTilt] = useState(null)
  const [posture, setPosture] = useState(true)


  useEffect(() => {
      enabledRef.current = enabled
  }, [enabled])


  useEffect(() => {
    if (!ready) return
    loadModel()
  }, [ready])

  async function loadModel() {

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

    // Wait until video has real dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      rafRef.current = requestAnimationFrame(detect)
      return
    }

    // Sync canvas size if needed
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
    }

    const ctx    = canvas.getContext('2d')

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const result = await poseLandmarkerRef.current.detectForVideo(video, performance.now())  // ← ref
    if (result.landmarks[0]) {
      const landmarks = result.landmarks[0]
      drawOverlay(ctx, landmarks, canvas.width, canvas.height)
      if (enabledRef.current){
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
    const badPosture = diff < 1.5;
    if (badPosture){
      console.log("BAD POSTURE")
      if (badPostureStart.current === null){
        badPostureStart.current = performance.now()
      }
      if (performance.now() - badPostureStart.current > 5000){
        if (numBadPosture.current > 15){
          console.log("SLOUCHING RAHHHHHH FOUND YOU MF")
        }
        numBadPosture.current = 0
        badPostureStart.current = null

      }
      numBadPosture.current += 1
    }
  }


  return (
    <div>
      <canvas ref={canvasRef} style={{ 
        display: 'block',
        width: '100%',
        maxWidth: '640px',
        borderRadius: '12px',
        marginTop: '1rem'
      }} />
    </div>
  )
}

export default PostureDetector