// MagicLinkForm.js
import { useState } from 'react';

import { auth, sendSignInLinkToEmail } from '../Firebase';

const MagicLink = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError(null);

        const actionCodeSettings = {
            url: `${import.meta.env.VITE_FRONTEND_URL}/finish-passwordless-signup`, // Redirect URL after login
            handleCodeInApp: true,  // Don't open the link in a browser
        };

        try {
            // console.log(actionCodeSettings.url)
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            localStorage.setItem('emailForSignIn', email);  // Store email for verification
            alert('Check your email for the magic link!');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }

    };

    return (
        <div>
            <h2>Login with Magic Link</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />
                <button type="submit" disabled={loading} style={{ backgroundColor: "rgb(110 0 255)" }} >
                    {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
            </form>
        </div>
    );
};

export default MagicLink;
