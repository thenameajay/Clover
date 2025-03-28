import { config } from "dotenv"
import mongoose from "mongoose"
config()
mongoose.connect(process.env.MONGODB_URI)

const db = mongoose.connection

db.once('open', () => { console.log("successfully connected with mongoDB") })
db.on('error', () => { console.log("not connected with database") })

export default db