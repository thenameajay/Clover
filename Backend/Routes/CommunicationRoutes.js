import express from 'express'
import { AddMembersToGroup, AddToContacts, BlockUser, changeDp, ChangeName, ChangeQuote, CreateGroup, GroupListOfUser, LeaveGroup, RemoveContact, SearchUser, SendBrowserNotification, SendMail, SetNotificationToken, showBlockList, showChatHistory, ShowContactList, ShowGroupChats } from '../Controllers/CommunicationControllers.js'
import { auth } from "../Firebase.js"

const communicationRouter = express.Router()

communicationRouter.post('/sendmail', SendMail)
communicationRouter.post('/send-notification', SendBrowserNotification)
communicationRouter.post('/set-notification-token', verifyFirebaseToken, SetNotificationToken)
communicationRouter.post('/chat-history', showChatHistory)
communicationRouter.post('/contact-list', ShowContactList)
communicationRouter.post('/search-user', SearchUser)
communicationRouter.post('/add-contact', AddToContacts)
communicationRouter.post('/remove-contact', RemoveContact)
communicationRouter.post('/create-group', CreateGroup)
communicationRouter.post('/add-members', AddMembersToGroup)
communicationRouter.post('/get-group-list', GroupListOfUser)
communicationRouter.post('/get-group-chats', ShowGroupChats)
communicationRouter.post('/block-user', BlockUser)
communicationRouter.post('/get-block-list', showBlockList)
communicationRouter.post('/change-dp', changeDp)
communicationRouter.post('/leave-group', LeaveGroup)
communicationRouter.post('/change-name', ChangeName)
communicationRouter.post('/change-quote', ChangeQuote)

async function verifyFirebaseToken(req, res, next) {
    var idToken = ""
    idToken = req.headers['authorization']
    if (!idToken) {
        res.status(401).send({ message: "firebase authorization token missing" })
    }
    try {
        const decodedToken = await auth.verifyIdToken(idToken)
        // console.log(decodedToken)
        req.user = decodedToken
        next()
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        return res.status(401).send('Invalid or expired token');
    }
}

export default communicationRouter