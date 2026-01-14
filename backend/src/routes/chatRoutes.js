import express from 'express'
import { getStreamToken } from '../controllers/chatController.js'
import { protectRoute } from '../middleware/protectRoute.js'

const router = express.Router()

Router.get("/token",protectRoute,getStreamToken)

export const router