import { useWebcam } from "../components/WebCam"
import PostureDetector from '../components/PostureDetector'
import EyeTracking from '../components/EyeTracking'
import styles from "./Home.module.css"
import { useEffect, useRef, useState } from 'react'

const VOICES = [
  { key: "deku",   label: "Deku"   },
  { key: "kratos", label: "Kratos" },
]

function Home() {
  const { videoRef, ready, startWebcam, stopWebcam } = useWebcam()
  const [postureEnabled, setPostureEnabled] = useState(true)
  const [eyeEnabled, setEyeEnabled] = useState(true)
    const [voice, setVoice] = useState("deku")
    const [profanity, setProfanity] = useState(false)
  const [eyeEnabled,     setEyeEnabled]     = useState(true)
  const [voice,          setVoice]          = useState("deku")
  const [hours,          setHours]          = useState(0)
  const [minutes,        setMinutes]        = useState(30)
  const [timeLeft,       setTimeLeft]       = useState(null)
  const timerRef = useRef(null)

  const totalSeconds = () => hours * 3600 + minutes * 60

  useEffect(() => {
    if (ready) {
      const duration = totalSeconds()
      setTimeLeft(duration)
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            stopWebcam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
      setTimeLeft(null)
    }

    return () => clearInterval(timerRef.current)
  }, [ready])

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
  }

  const isWarning = timeLeft !== null && timeLeft <= 5 * 60
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

  return (
    <div className={styles.page}>
      <video ref={videoRef} autoPlay playsInline muted className={styles.hiddenVideo} />

      {/* ── Top bar ── */}
      <header className={styles.topBar}>
        <h1 className={styles.title}>Posture Monitor</h1>

        {!ready && (
          <div className={styles.timerConfig}>
            <input type="number" min={0} max={23} value={hours}
              onChange={e => setHours(clamp(Number(e.target.value), 0, 23))} />
            <span className={styles.timerUnit}>hr</span>
            <input type="number" min={0} max={59} value={minutes}
              onChange={e => setMinutes(clamp(Number(e.target.value), 0, 59))} />
            <span className={styles.timerUnit}>min</span>
          </div>
        )}

        <div className={styles.controls}>
          <button className={styles.btnStart} onClick={startWebcam} disabled={ready || totalSeconds() === 0}>Start</button>
          <button className={styles.btnStop}  onClick={stopWebcam}  disabled={!ready}>Stop</button>
        </div>
 
      <PostureDetector videoRef={videoRef} ready={ready} enabled={postureEnabled} voice={voice} profanity={profanity} />
      <EyeTracking      videoRef={videoRef} ready={ready} enabled={eyeEnabled} voice={voice} profanity={profanity} />
      </header>

      {/* ── Video with overlaid countdown ── */}
      <div className={styles.videoWrapper}>
        <PostureDetector videoRef={videoRef} ready={ready} enabled={postureEnabled} voice={voice} />
        <EyeTracking     videoRef={videoRef} ready={ready} enabled={eyeEnabled}     voice={voice} />

        {ready && timeLeft !== null && (
          <div className={`${styles.timerBadge} ${isWarning ? styles.timerWarning : ''}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* ── Settings group ── */}
      <div className={styles.toggleGroup}>

        {/* Toggles row */}
        <div className={styles.toggleRow}>
          <label className={styles.toggleWrapper}>
            <span className={styles.toggleLabel}>Posture</span>
            <input type="checkbox" checked={postureEnabled} className={styles.checkbox} onChange={() => setPostureEnabled(p => !p)} />
          </label>
          <label className={styles.toggleWrapper}>
            <span className={styles.toggleLabel}>Eye tracking</span>
            <input type="checkbox" checked={eyeEnabled} className={styles.checkbox} onChange={() => setEyeEnabled(p => !p)} />
          </label>
        </div>

        {/* Voice row */}
        <div className={styles.voiceRow}>
          <span className={styles.toggleLabel}>Voice</span>
          <div className={styles.voicePills}>
            {VOICES.map(v => (
              <button
                key={v.key}
                className={`${styles.voicePill} ${voice === v.key ? styles.voicePillActive : ''}`}
                onClick={() => setVoice(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.toggleWrapper}>
            <span className={styles.toggleLabel}>Profanity</span>
            <input type="checkbox" checked={profanity} className={styles.checkbox} onChange={() => setProfanity(p => !p)} />
        </div>
      </div>
    </div>
  )
}

export default Home