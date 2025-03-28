// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, sendEmailVerification, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendSignInLinkToEmail, getIdToken, signInWithEmailLink, isSignInWithEmailLink, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { getToken, onMessage, getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FB_API_KEY,
    authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FB_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FB_APP_ID,
    measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get the Auth instance
const auth = getAuth(app);
const messaging = getMessaging(app)

// IndexedDB database------------------------------------------------------------------------------------------------------------------
const dbName = 'FirebaseClientCredentials';
const storeName = 'CredentialStore';

const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        // On database upgrade (first-time creation or version change)
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'projectId' }); // Object store with a unique key `id`
            }
        };

        // On success
        request.onsuccess = (event) => {
            resolve(event.target.result); // Return the opened database
        };

        // On error
        request.onerror = (event) => {
            reject('Error opening database: ' + event.target.errorCode);
        };
    });
};

// Save data to IndexedDB
const saveToDB = (data) => {
    return new Promise((resolve, reject) => {
        openDatabase()
            .then((db) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                // console.log(data)
                store.put(data); // Add or update the data
                transaction.oncomplete = () => resolve('Data saved successfully!');
                transaction.onerror = (event) => reject('Error saving data: ' + event.target.errorCode);
            })
            .catch((error) => reject(error));
    });
};

await saveToDB(firebaseConfig)
// IndexedDB database------------------------------------------------------------------------------------------------------------------


export { auth, sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendSignInLinkToEmail, getIdToken, signInWithEmailLink, isSignInWithEmailLink, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail, sendPasswordResetEmail, getToken, onMessage, messaging };