import { useState, useEffect } from "react";
import { auth, sendEmailVerification, createUserWithEmailAndPassword, onAuthStateChanged } from "../Firebase";
import Login from "./Login";
import Signup from "./Signup";
import MagicLink from "./MagicLink";
import GoogleLogin from "./GoogleLogin";
import axios from "axios";
import DeviceDetector from 'device-detector-js';
import { useNavigate } from 'react-router-dom';

function LoginSignUp() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isSignupMode, setIsSignupMode] = useState(false)
    const [signUpType, setSignUpType] = useState("")
    const [message, setMessage] = useState("")
    const [emailVerified, setEmailVerified] = useState(false)
    // const [displayImageURL, setDisplayImageURL] = useState()

    const navigate = useNavigate();

    useEffect(() => {
        // Set up the authentication state observer
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            // console.log(userCredential)
            if (!user) {
                return
            }
            const idToken = await user.getIdToken()
            if (user.emailVerified) {
                setEmailVerified(true)
            }
            // console.log("idtoken in loginsignup : " + idToken)

            var response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/protected-route`, {
                method: 'GET',
                headers: {
                    'authorization': `${idToken}`, // Include token in the Authorization header
                },
            });
            response = await response.json()
            if (response.status === 200) {
                setMessage("")
                setIsLoggedIn(true)
            }
            else {
                // setMessage(response.message)
            }
        });
        // // Clean up the subscription when the component is unmounted
        return () => unsubscribe();
    }, []);

    // useEffect(() => {
    //     console.log("loged in status : ", isLoggedIn)
    //     if (isLoggedIn) {
    //         
    //     }
    // }, [isLoggedIn])

    const handleSignup = async (newUser) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
            const user = userCredential.user;
            // console.log(userCredential)
            const userData = {
                email: user.email,
                user_details: {
                    name: newUser.name,
                    picture: user.photoURL,
                    phone_number: user.phoneNumber,
                    created_on: new Date(Number(user.metadata.creationTime)).toString(),
                    uid: user.uid,
                    email_verified: user.emailVerified,
                    quote: "Wonna talk with me..."
                }
            }

            setMessage("log in with new account")

            // console.log(userData)
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/save-signup-data`, { userData });
            // console.log("user credential ---->" + userCredential)
            // console.log("user ---->" + user)

            await sendEmailVerification(user);

            alert('Please check your email to verify your account!');

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

            // Get Firebase ID Token
            const idToken = await user.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/easy-login`, {
                method: 'POST',
                headers: {
                    'authorization': `${idToken}`, // Include token in the Authorization header
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    device_details
                )
            });
            if (response.status === 201) {
                user.verified = true
            }
            else {
                throw "user not verified !"
            }

            // console.log(user)
            // console.log(userCredential)
            // Send user data to the backend to store in Firebase Realtime Database

            // console.log("User created successfully");
            setIsSignupMode(!isSignupMode)
        } catch (error) {
            setMessage(error.message)
            // console.error("Error signing up:", error.message);
        }
    }

    // const handleLogout = async () => {
    //     // Log out the user
    //     try {
    //         // const idToken = await user.getIdToken()
    //         await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
    //             method: 'GET',
    //             headers: {
    //                 'authorization': `${idToken}`, // Include token in the Authorization header
    //             },
    //         });
    //         await signOut(auth).then(() => {
    //             // console.log("User has been signed out successfully from firebase.");
    //             setIsLoggedIn(false)
    //         }).catch((error) => {
    //             console.error("Error signing out:", error);
    //         });
    //     } catch (error) {
    //         // console.log(error)
    //         setMessage(error.message)
    //     }
    // }
    const handleLogin = (user) => {
        // Log out the user
        if (user.emailVerified && user.verified) {
            setIsLoggedIn(true)
            // console.log("user verified : " + user.verified)
            setMessage("")
        }
        else {
            setIsLoggedIn(false)
            setMessage("Verify your mail id first, check mail inbox")
        }

    }

    // async function loggingOutFromAll() {
    //     setIsLoggedIn(false)
    //     await fetch(`${import.meta.env.VITE_BACKEND_URL}/logoutalldevices`, {
    //         method: 'GET',
    //         headers: {
    //             'authorization': `${idToken}`, // Include token in the Authorization header
    //         },
    //     });
    // }

    if (signUpType === "magic-link") {
        return (
            <>
                <MagicLink />
                <button style={{ backgroundColor: "rgb(110 0 255)" }} onClick={() => setSignUpType("")} >back</button>
            </>
        )
    }
    else if (signUpType === "google-signup") {
        return (
            <>
                <GoogleLogin />
                <button style={{ backgroundColor: "rgb(110 0 255)" }} onClick={() => setSignUpType("")} >back</button>
            </>
        )
    }

    return (
        <div className="app">
            <h1>Welcome to the App</h1>

            <p style={{ color: "red" }}>{message}</p>
            {isLoggedIn ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <h2>You are logged in!</h2>
                    <a href={`${import.meta.env.VITE_FRONTEND_URL}`} style={{ fontSize: "smaller" }}>Go to home page</a>
                </div>
            ) : (
                <div>
                    {isSignupMode ? (
                        <Signup onSignup={handleSignup} />
                    ) : (
                        <Login onLogin={handleLogin} />
                    )}
                    <div className='btn-div'>
                        <button style={{ backgroundColor: "rgb(110 0 255)" }} onClick={() => setIsSignupMode(!isSignupMode)}>
                            {isSignupMode ? 'Login' : 'Signup'}
                        </button>
                        <button style={{ backgroundColor: "rgb(110 0 255)" }} onClick={() => setSignUpType("magic-link")}>
                            Passwordless Login
                        </button>
                    </div>
                    <div>
                        <p style={{ color: "rgb(110 0 255)", cursor: "pointer" }} onClick={() => setSignUpType("google-signup")} >Login with Google</p>
                        <p style={{ color: "rgb(110 0 255)", fontSize: "10px", cursor: "pointer" }} onClick={() => navigate('forgot-password')} >Forgot Password ?</p>
                        {!emailVerified ? (
                            <p style={{ color: "rgb(110 0 255)", fontSize: "10px", cursor: "pointer" }} onClick={() => navigate('mailverification')} >Verify Email</p>
                        ) : (<></>)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginSignUp



