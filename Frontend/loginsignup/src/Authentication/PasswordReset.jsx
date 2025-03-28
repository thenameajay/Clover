import { useState } from "react";
import { auth, sendPasswordResetEmail } from "../Firebase";

const PasswordReset = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");  // Reset error state

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent. Please check your inbox.");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading} style={{ backgroundColor: "rgb(110 0 255)" }} >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>
            {message && <p>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default PasswordReset;
