import { getAuth } from 'firebase-admin/auth';
import User from '../Schema/UserSchema.js'
import axios from 'axios'
import { config } from 'dotenv';

config()
export const SaveSignUpData = async (req, res) => {
    const { userData } = req.body
    const user = await User.findOne({ email: userData.email });
    if (user) {
        return res.status(409).json({ message: 'User already exists', stautus: 409 })
    }

    // Add the user details to Database
    try {
        const newUser = new User({
            email: userData.email,
            username: userData.email.split("@")[0],
            user_details: userData.user_details
        });
        await newUser.save();
        res.status(201).send({ message: "User created successfully", status: 201 });
    } catch (error) {
        console.log(error)
        return res.status(404).json({ message: 'Data Not Saved' })
    }
}

// Protected Route (Requires authentication)
export const ProtectedRoute = async (req, res) => {
    const email = req.user.email
    const token = req.headers['authorization']
    const user = await User.findOne({ email });

    if (!user) {
        console.log("error in protected route")
        return res.status(404).json({ message: 'Login please !' });
    }
    else {
        if (user.device_details.some(device => device.login_token === token)) {
            return res.status(200).json({ message: 'login access granted', status: 200 });
        }
        else {
            return res.status(401).json({ message: 'session expired, login again', status: 401 });
        }
    }
}

// logout
export const Logout = async (req, res) => {
    try {
        const email = req.user.email
        const user = await User.findOne({ email });
        // console.log("logout called")
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        if (!user) {
            console.log("error in logout")
            return res.status(404).json({ message: 'User not found' });
        }
        await User.updateOne(
            { email: user.email },                  // Filter: find the user with this email
            { $pull: { device_details: { login_token: token } } }  // Operation: Remove the device details from the array
        );
        res.status(200).json({ message: "logout: successfull", status: 200 });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: 'Internal Server Error' });
    }
}

export const LogoutSpecificAccount = async (req, res) => {
    try {
        const { email, device_id } = req.body
        // console.log(email)
        // console.log(device_id)

        await User.updateOne(
            { email: email },                  // Filter: find the user with this email
            { $pull: { device_details: { _id: device_id } } }  // Operation: Remove the device details from the array
        );
        // console.log(result)
        res.status(200).send({ message: "logout of device: successfull" })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: 'Internal Server Error' });
    }
}

// logout from all devices
export const LogOutAllDevices = async (req, res) => {
    const idToken = req.headers['authorization']
    const token_details = req.user
    const email = token_details.email
    const user = await User.findOne({ email })

    if (user.device_details.some(device => device.login_token === idToken)) {

        try {
            await User.updateOne(
                { email: user.email },                  // Filter: find the user with this email
                { $set: { device_details: [] } }
            );
            // Revoke all refresh tokens for the user
            await getAuth().revokeRefreshTokens(token_details.uid);
            // console.log(`Successfully logged out user from all devices.`);
            res.status(200).send({ message: "logout from all devices: successfull" })
        } catch (error) {
            console.error('Error logging out user from all devices:', error);
            return res.status(400).json({ message: 'Internal Server Error', status: 400 });
        }
    }
    else {
        // console.log("token expired, not present in database")
        return res.status(400).json({ message: 'Please login to make logout from all devices', status: 400 });
    }
}

export const EasyLogin = async (req, res) => {
    const device_details = req.body
    const token_details = req.user
    const email = token_details.email

    // Check if user exists
    var user = await User.findOne({ email });
    if (token_details.email_verified && !user.user_details.email_verified) {
        try {
            await User.updateOne(
                { email: email },  // Find the user by ID
                { $set: { "user_details.email_verified": true } }
            );
            user = await User.findOne({ email });
        } catch (error) {
            console.log("update error")
            console.log(error)
        }
    }

    try {
        await User.updateOne(
            { email: email },
            { $pull: { device_details: { user_agent: device_details.user_agent } } }
        )
    } catch (error) {
        console.log("error in removing User's prior login data.")
        console.log(error)
    }

    if (!user) {
        return res.status(400).json({ message: 'No user exists with such account' });
    }
    try {
        if (!user.user_details.email_verified) {
            throw "email id not verified"
        }
        const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var location = ""
        try {
            location = await axios.get(`http://ip-api.com/json/${ip_address}`);
            if (typeof location !== String) {
                throw "not a string"
            }
        } catch (error) {
            // console.log(error)
            location = "Unknown"
        }
        device_details.location = location
        device_details.ip_address = ip_address
        device_details.login_token = req.headers['authorization']

        await User.updateOne(
            { email: email },  // Find the user by ID
            { $push: { device_details: device_details } }  // Add new token to the array
        );

        user = await User.findOne({ email })

        var object_id = JSON.stringify(user.device_details.find(device => device.user_agent === device_details.user_agent && device.last_visit === device_details.last_visit)._id).slice(1, -1)

        if (object_id) {
            const specificLogoutLink = `${process.env.FRONTEND_URL}/logoutspecificaccount?email=${email}&object_id=${object_id}`

            await fetch(`${process.env.BACKEND_URL}/communication/sendmail`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        to: email, subject: "New Device Login", message: `
                <div>
                    <h3>Device Details</h3>
                    <p>Device Type : ${device_details.device_type}</p>
                    <p>Location : ${device_details.location}</p>
                    <p>Device Model : ${device_details.device_model ? device_details.device_model : "unknown"}</p>
                    <p>Operating System : ${device_details.os + " " + device_details.os_version}</p>
                    <p>Browser : ${device_details.browser_name}</p>
                    <p>Time : ${device_details.last_visit}</p>
                    <a href="${specificLogoutLink}">If it is not you, click here and change password</a>
                </div>
                `
                    }
                )
            });
        }
    } catch (error) {
        console.error('Error adding login token:', error);
        return res.status(404).json({ message: 'An Error Occured' });
    }
    res.status(201).json({ message: 'Login Successful', status: 201 });
}

export const ChangeEmailID = async (req, res) => {
    const { newEmail } = req.body
    const user = req.user

    // console.log(newEmail)

    try {
        // Update the user's email
        const auth = getAuth()
        await auth.updateUser(user.uid, { email: newEmail, emailVerified: false, });

        await User.updateOne(
            { email: user.email },  // Find the user by ID
            { $set: { "user_details.email_verified": false, email: newEmail } }
        );

        // Send a response indicating success
        res.status(200).json({ message: 'Email updated successfully' });
    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ error: error.message });
    }
}

export const GetUserInfo = async (req, res) => {
    const { username } = req.body
    try {
        const user = await User.findOne(
            { username: username },
            { username: 1, "user_details.name": 1, "user_details.picture": 1, "user_details.quote": 1 }
        )
        // console.log(user)
        res.status(200).send(user)
    } catch (error) {
        console.log("error in fetching user details !")
        console.log(error)
        res.status(400).send({ message: "An error occured !" })
    }
}

export const GetLoggedInDeviceDetails = async (req, res) => {
    const { username } = req.body
    try {
        if (username) {
            const deviceDetails = await User.findOne(
                { username: username },
                {
                    "device_details.device_model": 1,
                    "device_details.device_type": 1,
                    "device_details.os": 1,
                    "device_details.os_version": 1,
                    "device_details.browser_name": 1,
                    "device_details.last_visit": 1,
                    "device_details.location": 1,
                    "device_details._id": 1,
                }
            )
            // console.log(deviceDetails)
            res.status(200).send(deviceDetails.device_details)
        }
        else {
            res.status(400).send({ message: "Username is required !" })
        }
    } catch (error) {
        console.log("error occured while fetching logged in devices")
        console.log(error)
        res.status(400).send({ message: "Internal server error" })
    }
}

export const ClientSideSDK = async (req, res) => {
    try {
        const details = {
            apiKey: process.env.FIREBASE_CLIENT_API_KEY,
            authDomain: process.env.FIREBASE_CLIENT_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_CLIENT_PROJECT_ID,
            storageBucket: process.env.FIREBASE_CLIENT_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_CLIENT_APP_ID,
            measurementId: process.env.FIREBASE_CLIENT_MEASUREMENT_ID
        }
        res.status(200).send(details)
    } catch (error) {
        console.log("error in sending firebase client side sdk details.")
        console.log(error)
    }
}


// DIRECT CONNECTION OF FIREBASE AND CLIENT---------
// 1. LOW LOAD ON SERVER
// 2. NOW HEADACHE OF MANAGING AUTH
// 3. NO CONTROL OVER USER AUTH
// 4. IF SUSPIOUS USER FOUND, SEND MAIL.

// NOW FIREBASE LINKING OF FRONTEND ONLY CONNECTION VIA SERVER
// 1. MORE LOAD ON SERVER
// 2. FULL CONTROL ON USER AUTH

// PARTIAL CONNECTION OF FRONTEND WITH BOTH SERVER AN FIREBASE
// 1. MODERATE LOAD ON SERVER
// 2. CONTROL OVER USER AUTH
// 3. INEFFICIENT USE OF RESOURCES (LIKE DURING LOGIN, FIRST AUTHENTICATE VIA FIREBASE, THEN AUTHENTICATE FIREBASE TOKEN IN BACKEND)