import { requireAuth } from '@clerk/express'
import User from '../models/User.js'


export const protectRoute = [
    requireAuth({signInUrl:"/sign-in"}),
    async (req, res, next) => {
        try {
            const clerkId = req.auth.userId;
            if (!clerkId) return res.status(401).json({message : "Unauthorized - invalid token"})

            // find user in database
            const user = User.findOne({ clerkId })
            if (!user) return res.status(404).json({ message: "User not found" })
            req.user = user
            next()
        } catch (error) {
            console.log("Error in protect route middleware")
            res.status(401).json({message: "Inter server error"})
        }
    }
]