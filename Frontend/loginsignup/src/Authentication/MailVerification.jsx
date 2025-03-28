import { useEffect, useState } from 'react';
import { auth, sendEmailVerification } from '../Firebase';

const MailVerification = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                // Reload the user to check if email is verified
                await currentUser.reload();
                // console.log(currentUser)
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // const verifyEmail = async (req, res)=>{
    //     auth.
    // }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Please log in</div>;
    }

    if (!user.emailVerified) {
        return (
            <div>
                {/* <p>Verifing mail id ...</p> */}
                <p>Your email is not verified. Please verify your email first.</p>
                <button onClick={() => sendEmailVerification(user)} style={{ backgroundColor: "rgb(110 0 255)" }} >Resend Verification Email</button>
            </div>
        );
    }

    return <div>Welcome to the protected route!</div>;
};

export default MailVerification;
