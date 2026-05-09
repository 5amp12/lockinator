
import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

function EyeTracker({ videoRef, ready }){
    const canvasRef = useRef(null)
    const rafRef            = useRef(null)
    const faceLandmarkerRef = useRef(null)
    const postureRef = useRef(true)
    const lookingAwayStart = useRef(null);
    const numAwayLooks = useRef(0)

    const [running, setRunning] = useState(false)
    const [tilt, setTilt] = useState(null)
    const [posture, setPosture] = useState(true)
    const [isLookingAway, setIsLookingAway] = useState(false);


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
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task' },
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

        const result = await faceLandmarkerRef.current.detectForVideo(video, performance.now())  // ← ref
        if (result.faceLandmarks[0]) {
            const landmarks = result.faceLandmarks[0]
            // drawOverlay(ctx, landmarks, canvas.width, canvas.height)
            if (postureRef.current){
                computeEyeTracking(landmarks);
            }   
        }

        rafRef.current = requestAnimationFrame(detect)
    }

    //setting skeletion lines overlay
    // function drawOverlay(ctx, landmarks, canvasW, canvasH) {
    //     landmarks.forEach(pt => {
    //         ctx.beginPath()
    //         ctx.arc(pt.x * canvasW, pt.y * canvasH, 5, 0, 2 * Math.PI)
    //         ctx.fillStyle = 'red'
    //         ctx.fill()
    //     })
    // } 

    function computeEyeTracking(landmarks) {

        const nose = landmarks[1];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];

        const avgEye = (leftEye.x + rightEye.x) / 2

        const diff = avgEye - nose.x

        const lookingAway = Math.abs(avgEye - nose.x) > 0.02;

        if (lookingAway){
            if (lookingAwayStart.current === null){
                lookingAwayStart.current = performance.now()
                
            }
            if (performance.now() - lookingAwayStart.current > 5000){
                if (numAwayLooks.current > 40){
                    //Looking away consistently
                    console.log("GET OFF YOUR PHONE");
                }
                console.log(numAwayLooks);
                numAwayLooks.current = 0
                setIsLookingAway(false)
                lookingAwayStart.current = null
            }
            numAwayLooks.current += 1
        }

        // // Does not work properly
        // const avgEyeH = (leftEye.y + rightEye.x) / 2

        // const diff2 = avgEyeH - nose.y

        // if (diff2 < -0.08){
        //     console.log("Get of your phone height");
        // }
        // console.log(diff2);
    }


    return (
        <div>
            <canvas ref={canvasRef} style={{ display: 'none' }}/>
        {/* // <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
        // <p>Head tilt: {tilt !== null ? `${tilt}°` : '–'}</p> */}
        {/* <label class="switch"> */}
        <input type="checkbox" checked={posture} onChange={() => {
                postureRef.current = !postureRef.current
                setPosture(p => !p)
        }} />
            

        </div>
    )
}

export default EyeTracker;