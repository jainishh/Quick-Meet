// Give the service worker access to Firebase Messaging.
// Note: You must use the same version of the SDK as in your web app.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in your configuration.
// REPLACE THIS WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
firebase.initializeApp({
    apiKey: "AIzaSyCHlP71q9ZQ9O_ozA1DUo3Xb5wBkKE7xf8",
  authDomain: "quickmeet-af798.firebaseapp.com",
  projectId: "quickmeet-af798",
  storageBucket: "quickmeet-af798.firebasestorage.app",
  messagingSenderId: "497787112271",
  appId: "1:497787112271:web:c63e40499f9b754d5a933a",
  measurementId: "G-XQ5KWW52S8"
});

self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activating...');
  event.waitUntil(clients.claim());
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png' // Modify this path to your app's icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
