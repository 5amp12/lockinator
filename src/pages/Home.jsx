import { useWebcam } from "../components/WebCam"
import PostureDetector from '../components/PostureDetector'
import EyeTracking from '../components/EyeTracking'
import styles from "./Home.module.css"
import { useEffect, useRef, useState } from 'react'

const VOICES = [
    { key: "deku", label: "Deku"},
    { key: "kratos", label: "Kratos" },
]

function Home() {
  const { videoRef, ready, startWebcam, stopWebcam } = useWebcam()
  const [postureEnabled, setPostureEnabled] = useState(true)
  const [eyeEnabled, setEyeEnabled] = useState(true)
    const [voice, setVoice] = useState("deku")
  return (
    <div className={styles.page}>
      <video ref={videoRef} autoPlay playsInline muted className={styles.hiddenVideo} />
 
      <h1 className={styles.title}>Posture monitor</h1>
 
      <div className={styles.controls}>
        <button className={styles.btnStart} onClick={startWebcam} disabled={ready}>Start</button>
        <button className={styles.btnStop}  onClick={stopWebcam}  disabled={!ready}>Stop</button>
      </div>

        <div className={styles.voiceSelector}>
            <label htmlFor="voice-select" className={styles.toggleLabel}>Voice</label>
            <select id="voice-select"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className={styles.select}>
                {VOICES.map(v => (
                    <option key={v.key} value={v.key}>{v.label}</option>
                ))}
            </select>
        </div>
 
      <PostureDetector videoRef={videoRef} ready={ready} enabled={postureEnabled} voice={voice} />
      <EyeTracking      videoRef={videoRef} ready={ready} enabled={eyeEnabled} voice={voice}/>

      <div className={styles.toggleGroup}>
        <div className={styles.toggleWrapper}>
          <span className={styles.toggleLabel}>Posture detection</span>
          <input type="checkbox" checked={postureEnabled} className={styles.checkbox} onChange={() => setPostureEnabled(p => !p)} />
        </div>
        <div className={styles.toggleWrapper}>
          <span className={styles.toggleLabel}>Eye tracking</span>
          <input type="checkbox" checked={eyeEnabled} className={styles.checkbox} onChange={() => setEyeEnabled(p => !p)} />
        </div>
      </div>
    </div>
  )
}
 
export default Home
 