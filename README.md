# Posture Monitor

A real-time posture and eye tracking monitor built with React and MediaPipe. Get audio feedback from your favourite characters when your posture slips or you look away from the screen.

Built for University of Kent hackathon.

---

## Features

- **Posture detection** — alerts you when your posture deteriorates
- **Eye tracking** — detects when you look away from the screen
- **Voice feedback** — choose between Deku or Kratos for audio alerts
- **Session timer** — set a custom hour/minute duration, auto-stops when time runs out
- **Live video overlay** — landmark visualisation drawn directly on the camera feed

---

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A webcam

### Install dependencies

```bash
npm install
```

### Run the app

You need two terminals running simultaneously:

**Terminal 1 — Frontend**
```bash
npm run dev
```

**Terminal 2 — Backend server**
```bash
node server.js
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

1. Set your session duration using the **hr** and **min** inputs
2. Click **Start** to activate the webcam
3. Select a **voice** for audio feedback (Deku or Kratos)
4. Toggle **Posture** and **Eye tracking** on or off as needed
5. The session will automatically stop when the timer runs out, or click **Stop** manually

---

## Tech Stack

- **React** — UI framework
- **MediaPipe** — Pose and face landmark detection
- **Vite** — Dev server and bundler
- **Node.js** — Backend server
- **ElevenLabs** — Voices