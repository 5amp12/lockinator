import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'



function EyeTracker({ videoRef, ready, enabled, voice }){
    const canvasRef = useRef(null)
    const rafRef = useRef(null)
    const faceLandmarkerRef = useRef(null)
    const lookingAwayStart  = useRef(null)
    const numAwayLooks      = useRef(0)
    const audioPlayingRef   = useRef(false)
    const enabledRef        = useRef(enabled)
    const detectingRef      = useRef(false)
    const voiceRef          = useRef(voice)

    const [running, setRunning] = useState(false)

    useEffect(() => { enabledRef.current = enabled }, [enabled])
    useEffect(() => { voiceRef.current = voice }, [voice])

    useEffect(() => {
        if (!ready) return
        loadModel()
    }, [ready])

    const playAudio = async (voiceKey, messageKey) => {
        try {
            const response = await fetch(`http://localhost:3001/audio/${voiceKey}/${messageKey}`)
            if (!response.ok) return
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const audio = new Audio(url)
            audio.play()
        } catch (err) {
            console.error("Audio fetch failed:", err)
        }
    }

    async function loadModel() {
        const { videoWidth: w, videoHeight: h } = videoRef.current
        canvasRef.current.width  = w
        canvasRef.current.height = h

        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        )
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
            },
            runningMode: 'VIDEO',
            numPoses: 1,
        })

        setRunning(true)
        rafRef.current = requestAnimationFrame(detect)
    }

    async function detect() {
        if (detectingRef.current) {
            rafRef.current = requestAnimationFrame(detect)
            return
        }

        const video  = videoRef.current
        const canvas = canvasRef.current

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            rafRef.current = requestAnimationFrame(detect)
            return
        }

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width  = video.videoWidth
            canvas.height = video.videoHeight
        }

        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const result = await faceLandmarkerRef.current.detectForVideo(video, performance.now())
        if (result.faceLandmarks[0]) {
            const landmarks = result.faceLandmarks[0]
            if (enabledRef.current) {
                computeEyeTracking(landmarks)
            }
        }

        rafRef.current = requestAnimationFrame(detect)
    }

    function computeEyeTracking(landmarks) {
        const nose     = landmarks[1]
        const leftEye  = landmarks[33]
        const rightEye = landmarks[263]

        const avgEye = (leftEye.x + rightEye.x) / 2
        console.log(avgEye - nose.x)

        // console.log(diff);

        const lookingAway = Math.abs(avgEye - nose.x) > 0.02;

        const avgEyeH = (leftEye.y + rightEye.y) / 2

        const eyeWidth = Math.abs(rightEye.x - leftEye.x)
        const diff2 = (avgEyeH - nose.y) / eyeWidth
        const lookingDown = diff2 < -0.80;
        console.log(diff2)

        if (lookingAway || lookingDown){
            if (lookingAwayStart.current === null){
                lookingAwayStart.current = performance.now()
            }
            if (performance.now() - lookingAwayStart.current > 3000) {
                if (numAwayLooks.current > 13 && !audioPlayingRef.current) {
                    console.log("hitting look away")
                    audioPlayingRef.current = true
                    playAudio(voiceRef.current, "getOffYourPhone")
                    setTimeout(() => { audioPlayingRef.current = false }, 10000)
                }
                console.log(numAwayLooks)
                numAwayLooks.current     = 0
                lookingAwayStart.current = null
            }
            numAwayLooks.current += 1
        }
        // Does not work properly
        
        // console.log(diff2);
    }

    return (
        <div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    )
}

export default EyeTracker