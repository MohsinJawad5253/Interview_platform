import mongoode from 'mongoose'
import { ENV } from './env.js'

export const connectDB = async () => {
    try {
        const connection = await mongoode.connect(ENV.DB_URL)
        console.log("Connected to DataBase ✅😂", connection.connection.host)
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB Database :" , error)
        process.exit(1)
    }
}