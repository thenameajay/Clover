importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");


// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
// Get data from IndexedDB

const dbName = 'FirebaseClientCredentials';
const storeName = 'CredentialStore';
const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        // On database upgrade (first-time creation or version change)
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' }); // Object store with a unique key `id`
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

const getFromDB = (id) => {
    return new Promise((resolve, reject) => {
        openDatabase()
            .then((db) => {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(id); // Get data by `id`
                request.onsuccess = (event) => resolve(event.target.result);
                request.onerror = (event) => reject('Error retrieving data: ' + event.target.errorCode);
            })
            .catch((error) => reject(error));
    });
};


var firebaseApp
var messaging
getFromDB('clover-8498f').then((data) => {
    firebaseApp = firebase.initializeApp(data);
    messaging = firebase.messaging(firebaseApp);

    // messaging?.onBackgroundMessage(function (payload) {
    //     // console.log('Received background message ', payload);

    //     const notificationTitle = payload.notification.title;
    //     const notificationOptions = {
    //         body: payload.notification.body,
    //         icon: '/firebase-logo.png',  // You can set a custom icon here
    //     };

    //     // Display the notification
    //     self.registration.showNotification(notificationTitle, notificationOptions);
    // });
})


// const firebaseApp = firebase.initializeApp();

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
// const messaging = firebase.messaging(firebaseApp);

messaging?.onBackgroundMessage(function (payload) {
    // console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png',  // You can set a custom icon here
    };

    // Display the notification
    self.registration.showNotification(notificationTitle, notificationOptions);
});
