// ChangeEmailForm.js
import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';

const ChangeEmailID = () => {
    const [newEmail, setNewEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleEmailChange = async (e) => {
        e.preventDefault();

        const auth = getAuth();
        const user = auth.currentUser;  // Get the currently authenticated user
        const idToken = await user.getIdToken()

        if (!user) {
            setError('You must be logged in to change your email.');
            return;
        }

        if (!validateEmail(newEmail)) {
            setError("Email id not valid !")
            return
        }

        try {
            // console.log(user)
            // console.log("id token --> " + idToken)

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/change-email-id`, {
                method: 'POST',
                headers: {
                    'authorization': `${idToken}`, // Include token in the Authorization header
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    { newEmail: newEmail }
                )
            });

            if (response.status === 200) {
                setMessage('Email updated successfully!');
            }
            setError('');
        } catch (error) {
            // console.error('Error updating email:', error.message);
            setError(error.message);
        }

        function validateEmail(email) {
            const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            return re.test(email)
        }
    };

    return (
        <div>
            <h2>Change Email Address</h2>
            <form onSubmit={handleEmailChange}>
                <label>New Email:</label>
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                />
                <button type="submit">Change Email</button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
        </div>
    );
};

export default ChangeEmailID;
