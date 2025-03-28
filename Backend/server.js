import express from "express"
import cors from 'cors'
import "./DB/Db.js"
import { config } from "dotenv"
import communicationRouter from "./Routes/CommunicationRoutes.js"
import cloudRouter from "./Routes/CloudStorageRoutes.js"
import authRouter from "./Routes/AuthRoutes.js"
import { createServer } from "http"
import { Server } from "socket.io"
import { ListenToConnection } from "./Sockets/SocketEvents.js"

config();

const app = express();
const port = process.env.PORT || 5000;


app.use(express.json()); // For parsing JSON data
app.use(cors({ origin: '*' }))
// app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use('/', authRouter)
app.use('/communication', communicationRouter)
app.use('/cloud', cloudRouter)

// SOCKET CODE-----------------------------------------------
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
})
// const io = new Server(httpServer, {
//     cors: {
//         origin: process.env.FRONTEND_URL,
//         methods: ['GET', 'POST'],
//         credentials: true
//     }
// })

ListenToConnection(io)

// io.on('connection', (socket) => {
//     console.log("Connection established with socketId : " + socket.id)

//     ListenIncomingMessages(socket)

//     socket.on('disconnect', () => {

//     })
// })
// SOCKET CODE-----------------------------------------------

// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

httpServer.listen(port, () => {
    console.log('Http Server Established. Available at PORT : ' + port)
})