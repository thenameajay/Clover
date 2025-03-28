import express from 'express'
import { SaveSignUpData, EasyLogin, ProtectedRoute, Logout, LogoutSpecificAccount, LogOutAllDevices, ChangeEmailID, GetUserInfo, GetLoggedInDeviceDetails, ClientSideSDK } from '../Controllers/authControllers.js'
const authRouter = express.Router()
import { auth } from "../Firebase.js"

authRouter.post('/save-signup-data', SaveSignUpData)
authRouter.post('/easy-login', verifyFirebaseToken, EasyLogin)
authRouter.get('/protected-route', verifyFirebaseToken, ProtectedRoute)
authRouter.get('/logout', verifyFirebaseToken, Logout)
authRouter.post('/logoutspecificaccount', LogoutSpecificAccount)
authRouter.get('/logoutalldevices', verifyFirebaseToken, LogOutAllDevices)
authRouter.post('/change-email-id', verifyFirebaseToken, ChangeEmailID)
authRouter.post('/user-info', GetUserInfo)
authRouter.post('/logged-in-devices-info', GetLoggedInDeviceDetails)
authRouter.post('/client-sdk-details', ClientSideSDK)



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

export default authRouter