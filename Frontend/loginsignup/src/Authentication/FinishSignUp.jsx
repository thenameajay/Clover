// src/FinishSignUp.js
import { useEffect, useState } from 'react';
import { auth, getIdToken, signInWithEmailLink, isSignInWithEmailLink } from '../Firebase.jsx';
import DeviceDetector from 'device-detector-js';
import axios from 'axios';

const FinishSignUp = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    useEffect(() => {
        if (user) {
            // console.log("user is returned here")
            return
        }
        const email = localStorage.getItem('emailForSignIn');
        const emailLink = window.location.href;
        // console.log(emailLink)

        try {
            if (isSignInWithEmailLink(auth, emailLink)) {
                if (!email) {
                    setError('Invalid or expired link.');
                    setLoading(false);
                } else {
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
                    // console.log("mark -1")
                    signInWithEmailLink(auth, email, emailLink)
                        .then((result) => {
                            // console.log("mark 0")
                            setUser(result.user);
                            setLoading(false);

                            const currentUser = auth.currentUser
                            // console.log("mark 0.1")
                            // console.log(currentUser)
                            if (currentUser && currentUser.reloadUserInfo.createdAt === currentUser.reloadUserInfo.lastLoginAt) {
                                // console.log("mark 0.2")
                                getIdToken(currentUser, true).then(async (idToken) => {
                                    // console.log("mark 0.3")

                                    const userData = {
                                        email: currentUser.email,
                                        user_details: {
                                            name: currentUser.email,
                                            picture: currentUser.photoURL,
                                            phone_number: currentUser.phoneNumber,
                                            created_on: new Date(currentUser.metadata.createdAt).toString(),
                                            uid: currentUser.uid,
                                            email_verified: currentUser.emailVerified,
                                            quote: "Wonna talk with me..."
                                        }
                                    }
                                    // console.log(userData)
                                    // console.log("mark 0.4")
                                    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/save-signup-data`, { userData });
                                    // console.log("signed up successfully")

                                    setError("")
                                    await fetch(`${import.meta.env.VITE_BACKEND_URL}/easy-login`, {
                                        method: 'POST',
                                        headers: {
                                            'authorization': `${idToken}`, // Include token in the Authorization header
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(
                                            device_details
                                        )
                                    });
                                }).catch((error) => {
                                    console.error('Error fetching ID token:', error);
                                });
                            }
                            else if (currentUser.reloadUserInfo.createdAt !== currentUser.reloadUserInfo.lastLoginAt) {
                                getIdToken(currentUser, true).then(async (idToken) => {
                                    setError("")
                                    await fetch(`${import.meta.env.VITE_BACKEND_URL}/easy-login`, {
                                        method: 'POST',
                                        headers: {
                                            'authorization': `${idToken}`, // Include token in the Authorization header
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(
                                            device_details
                                        )
                                    });
                                    // console.log("user loged in")
                                }).catch((error) => {
                                    console.error('Error fetching ID token:', error);
                                });
                            }
                            return
                        })
                        .catch((err) => {
                            // console.log("mark 1")
                            console.log(err)
                            setError(err.message);
                            setLoading(false);
                        });
                }
            } else {
                // console.log("magic link : " + emailLink)
                setError('This is not a valid magic link.');
                setLoading(false);
            }
        } catch (error) {
            console.log(error)
            return
        }
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Welcome, {user?.email}</h2>
            <p>You are now signed in with your magic link!</p>
            <a href={`${import.meta.env.VITE_FRONTEND_URL}`} style={{ color: "rgb(110 0 255)" }}>click here to continue</a>
        </div>
    );
};

export default FinishSignUp;
