import express from 'express'
import { ENV } from './lib/env.js'
import path from 'path'
import { connetDB } from './lib/db.js'

const app = express()

const __dirname = path.resolve()

app.get("/books", (req,res)=> {
    res.status(200).json({msg : "api is books"})
})

if(ENV.NODE_ENV == "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))

    app.get("/{*any}" , (req,res) => {
        res.sendFile(path.join(__dirname,"../frontend/","dist","index.html"))
    })
}

const startServer = async () => {
    try {
       await connetDB()
       app.listen(ENV.PORT, () => console.log("server up on " ,ENV.PORT));
    } catch (error) {
        console.error("❌Error starting the server")
    }
}

startServer();