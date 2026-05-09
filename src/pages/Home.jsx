import { useWebcam } from "../components/WebCam"
import PostureDetector from '../components/PostureDetector'
import EyeTracking from '../components/EyeTracking'
 
function Home() {
  const { videoRef, ready, startWebcam, stopWebcam } = useWebcam()
  return (
    <div>
      <h1>Phone Posture Detector</h1>
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />

      <button onClick={startWebcam} disabled={ready}>Start</button>
      <button onClick={stopWebcam}  disabled={!ready}>Stop</button>

      {/* Both components receive the same video element */}
      <PostureDetector videoRef={videoRef} ready={ready} />
      <EyeTracking videoRef={videoRef} ready={ready} />
    </div>
  )
}
 
export default Home
 