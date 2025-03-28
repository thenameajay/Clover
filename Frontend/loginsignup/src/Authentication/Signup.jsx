import { useState } from 'react';
import '../Styles/Styles.css'
import PropTypes from 'prop-types';  // Import PropTypes from the prop-types package

const Signup = ({ onSignup }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignup = (e) => {
        e.preventDefault();

        // Simple validation
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Simulate signup process
        const newUser = { name, email, password };

        // Call signup handler from parent or perform API request
        onSignup(newUser);

        // Clear the fields and error
        setEmail('');
        setName('');
        setPassword('');
        setConfirmPassword('');
        setError('');

    };

    return (
        <div className="signup-container">
            <h2>Signup</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSignup}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
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
                <div>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button style={{ backgroundColor: "rgb(110 0 255)" }} type="submit">Signup</button>
            </form>
        </div>
    );
};

Signup.propTypes = {
    onSignup: PropTypes.func.isRequired,  // Validate 'onLogin' as a function
};

export default Signup;
