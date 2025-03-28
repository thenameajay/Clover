// GoogleLogin.js
import { useState } from 'react';
import DeviceDetector from 'device-detector-js';
import { auth, GoogleAuthProvider, signInWithPopup } from '../Firebase.jsx';
import axios from 'axios';

const GoogleLogin = () => {
    const [user, setUser] = useState(null);
    const [errorMesage, setErrorMesage] = useState(null);
    const handleLogin = async () => {
        try {
            const deviceDetector = new DeviceDetector();
            const userAgent = navigator.userAgent;
            const deviceData = deviceDetector.parse(userAgent);
            const device_details = {
                user_agent: userAgent,
                device_type: deviceData.device.type,
                device_model: deviceData.device.model,
                os: deviceData.os.name,
                os_version: deviceData.os.version,
                browser_name: deviceData.client.name,
                last_visit: new Date().toString().slice(0, 21)
            }

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = result._tokenResponse.idToken
            // console.log(result)

            const userData = {
                email: result.user.email,
                user_details: {
                    name: result.user.displayName,
                    picture: result.user.reloadUserInfo.photoUrl,
                    phone_number: result.user.phoneNumber,
                    created_on: new Date(Number(result.user.metadata.createdAt)).toString(),
                    uid: result.user.uid,
                    email_verified: result.user.emailVerified,
                    quote: "Wonna talk with me...",
                }
            }
            // console.log(typeof Number(result.user.metadata.createdAt))

            try {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/save-signup-data`, { userData });
            } catch (error) {
                console.log(error)
                console.log("user already exists, we are logging in you instead !")
            }


            // console.log("mark 001")
            const res2 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/easy-login`, {
                method: 'POST',
                headers: {
                    'authorization': `${idToken}`, // Include token in the Authorization header
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    device_details
                )
            });

            if (res2.status == 201) {
                setUser(result.user.reloadUserInfo.displayName)
            }
            else {
                setErrorMesage("Something went wrong !")
            }

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div style={{ display: "flex" }}>
            {user ? (
                <div>
                    <h1>Welcome, {user}</h1>
                    <a href={`${import.meta.env.VITE_FRONTEND_URL}`}>click here to continue</a>
                    {/* You can render user info here */}
                </div>
            ) : (
                <>
                    <h4>{errorMesage}</h4>
                    <button style={{ backgroundColor: "rgb(110 0 255)" }} onClick={handleLogin}>Login with Google</button>
                </>
            )}
        </div>
    );
};

export default GoogleLogin;
