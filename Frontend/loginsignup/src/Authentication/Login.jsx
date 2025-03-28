import { useState } from 'react';
import { signInWithEmailAndPassword, auth } from "../Firebase";
import DeviceDetector from 'device-detector-js';
import '../Styles/Styles.css'
import PropTypes from 'prop-types';  // Import PropTypes from the prop-types package

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        // console.log("login called")
        e.preventDefault();
        try {
            if (!validateEmail(email)) {
                throw "Invalid Mail ID"
            }

            // Simple validation
            if (!email || !password) {
                throw "Both fields required !"
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // console.log("user -->")
            // console.log(user)
            // console.log("user ----------------------")
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
            // console.log("calling login api")
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
            // console.log(response)
            // console.log(idToken)
            if (response.status === 201) {
                user.verified = true
            }
            else {
                throw "user not verified !"
            }

            // Call login handler from parent or perform API request
            onLogin(user);

            // Clear the fields and error
            setEmail('');
            setPassword('');
            setError('');
        } catch (error) {
            // console.log("mark 3")
            if (error.message === "Firebase: Error (auth/invalid-credential).") {
                setError("Invalid Credentials !")
            }
            else {
                setError(error.message ? error.message : error)
                // console.log(error.message)
            }
        }

    };

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(email)
    }

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button style={{ backgroundColor: "rgb(110 0 255)" }} type="submit" >Login</button>
            </form>
        </div>
    );
};

Login.propTypes = {
    onLogin: PropTypes.func.isRequired,  // Validate 'onLogin' as a function
};

export default Login;
