import express from "express"
import cors from "cors"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import dotenv from "dotenv"
import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, "../.env") })

const app = express()
app.use(cors())
app.use(express.json())

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
})

const voices = {
    kratos: "n5fC6zPG380LFQfIhumx",
    deku: "henIuc3B4M8m67bTv1JS",
    peter_griffin: "qZigFhbH67kODRONKHG6",
    david_attenborough: "MgEBBOUqxg94RhF7jNwg"
}

const outputFormat = "mp3_44100_128"
const modelId = "eleven_v3"

const messages = {
    getOffYourPhone: "GET OFF YOUR PHONE!",
    whyAreYouStillOnYourPhone: "WHY ARE YOU STILL ON YOUR PHONE?!",
    fixYourPosture: "FIX YOUR POSTURE!",
    sitUp: "SIT UP! STOP SLOUCHING!",
    lockIn: "LOCK IN RIGHT NOW!",
    getOffYourPhoneProfane: "GET OFF YOUR FUCKING PHONE RIGHT NOW YOU FUCK!",
    lockInProfane: "BRO LOCK THE FUCK IN! NOW!",
    fixYourPostureProfane: "FIX YOUR FUCKING BITCH ASS POSTURE!",
    fixSlouchingProfane: "WHY IS YOUR SPINE FUCKING CURVED"
}

app.get("/audio/:voiceKey/:messageKey", async (req, res) => {
    const voiceID = voices[req.params.voiceKey]
    const text = messages[req.params.messageKey]

    if (!text) {
        return res.status(404).json({ error: "Message not found" })
    }

    try {
        const audio = await elevenlabs.textToSpeech.convert(voiceID, {
            text,
            modelId,
            outputFormat,
        })

        res.setHeader("Content-Type", "audio/mpeg")

        const reader = audio.getReader()
        const pump = async () => {
            const { done, value } = await reader.read()
            if (done) { res.end(); return }
            res.write(value)
            pump()
        }
        await pump()

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to generate audio" })
    }
})

app.listen(3001, () => console.log("Server running on port 3001"))