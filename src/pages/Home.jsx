import { useWebcam } from "../components/WebCam"
import PostureDetector from '../components/PostureDetector'
import EyeTracking from '../components/EyeTracking'
import styles from "./Home.module.css"
 
function Home() {
  const { videoRef, ready, startWebcam, stopWebcam } = useWebcam()
  return (
    <div className={styles.page}>
      <video ref={videoRef} autoPlay playsInline muted className={styles.hiddenVideo} />
 
      <h1 className={styles.title}>Posture monitor</h1>
 
      <div className={styles.controls}>
        <button className={styles.btnStart} onClick={startWebcam} disabled={ready}>Start</button>
        <button className={styles.btnStop}  onClick={stopWebcam}  disabled={!ready}>Stop</button>
      </div>
 
      <PostureDetector videoRef={videoRef} ready={ready} />
      <EyeTracking      videoRef={videoRef} ready={ready} />
    </div>
  )
}
 
export default Home
 