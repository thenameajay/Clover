// Initialize Firebase Admin SDK (v9+)
import { config } from 'dotenv';
import admin from 'firebase-admin';
config()

// Initialize Firebase Admin SDK with service account credentials
// import serviceAccount from './FirebaseServiceKey.json' assert { type: 'json' };
const serviceAccount = {
    type: process.env.FIREBASE_ACCOUNT_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const auth = admin.auth();

// Function to get OAuth2 access token for Firebase HTTP v1 API
const getAccessToken = async () => {
    // Firebase Admin SDK automatically handles authentication
    const credentials = admin.credential.applicationDefault();
    const accessToken = await credentials.getAccessToken();
    return accessToken.token;
};

export { admin, getAccessToken, auth }