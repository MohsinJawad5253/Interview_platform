
import { chatClient, streamClient } from '../lib/stream.js'
import Session from '../models/Session.js'
export async function createSession(req, res) {
    try {
        const { problem, difficulty } = req.body
        const clerkId = req.user.clerkId
        const userId = req.user._id

        if (!problem || !difficulty) return rex.status(400).json({ message: "Problem and Difficulty is required" })

        //generate call id

        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`

        const session = await Session.create(
            {
                problem,
                difficulty,
                host: userId,
                callId
            }
        )

        await streamClient.video.call("default", callId).getOrCreate({
            data: {
                created_by_id: clerkId,
                custom: { problem, difficulty, sessionId: session._id.toString() }
            },
        })

        //Chat messaging

        const channel = chatClient.channel("messaging", callId, {
            name: `${problem} Session`,
            created_by_id: clerkId,
            members: [clerkId]
        })

        await channel.create()

        res.status(201).json({ session })
    } catch (error) {
        console.log("Error in create Session cntroller")
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export async function getActiveSessions(_, res) {
    try {
        const sessions = await Session.findOne({ status: "active" })
            .populate("host", "name profileImage email clerkId")
            .sort({ createdAt: -1 })
            .limit(20)

        res.status(200).json({ sessions })
    } catch (error) {
        console.log("Error in getActiveSessions Controller:", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export async function getMyRecentSessions(req, res) {
    try {
        const userId = req.user._id

        const sessions = await Session.find({
            status: "completed",
            $or: [{ host: userId }, { participant: userId }]
        })
            .sort({ createdAt: -1 })
            .limit(20)

        res.status(200).json({ sessions })
    } catch (error) {
        console.log("Error in getRecentSessions Controller:", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export async function getSessionById(req, res) {
    try {
        const { id } = req.params
        const session = await Session.findById(id)
            .populate("host", "name email profileImage clerkId")
            .populate("participant", "name email profileImage clerkId")

        if (!session) return res.status(404).json({ message: "Session not found" })

       

        res.status(200).json({ session })
    } catch (error) {
        console.log("Error in getSessionById Controller:", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export async function jionSession(req, res) {
    try {
        const { id } = req.params
        const userId = req.user._id
        const clerkId = req.user.clerkId

        const session = await Session.findById(id)

        if (!session) return res.status(404).json({ message: "Session not found" })

             if (session.status !== "active") return res.status(400).json({ message: "cannot join a completed session" })

        if (session.host.toString() === userId.toString()) {
            return res.status(400).json({ message: "Host cannot join their own session as participant" })
        }

        if (session.participant) return res.status(409).json({ message: "Session is full" })

        session.participant = userId
        await session.save()

        const channel = chatClient.channel("messaging", session.callId)
        await channel.addMembers([clerkId])

        res.status(200).json({ session })
    } catch (error) {
        console.log("Error in joinSession Controller:", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export async function endSession(req, res) {
    try {
        const { id } = req.params
        const userId = req.user._id
        const clerkId = req.user.clerkId

        const session = await Session.findById(id)

        if (!session) return res.status(404).json({ message: "Session not found" })

        if (session.host.toString() !== userId.toString()) {
            res.status(403).json({ message: "Only host can end the Session" })
        }

        if (session.status === "completed") {
            res.status(400).json({ message: "Session is already completed" })
        }

        const call = streamClient.video.call("default", session.callId)
        await call.delete({ hard: true })


        const channel = streamClient.channel("messaging", callId)
        await channel.delete()

         session.status = "completed"
        session.save()

        res.status(200).json({ message: "Session completed successfully" })
    } catch (error) {
        console.log("Error in endSession Controller:", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}