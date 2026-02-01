// This service worker file must be located in the public directory.
self.importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
    "projectId": "studio-6475847052-44038",
    "appId": "1:1076749036943:web:39a57ae88e0e5db0152ffa",
    "apiKey": "AIzaSyAIagFb2PhMOowGuUZNuWW3ZzSCEUhviFQ",
    "authDomain": "studio-6475847052-44038.firebaseapp.com",
    "measurementId": "",
    "messagingSenderId": "1076749036943"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        // icon: '/logo.png' // You can add an icon here
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
