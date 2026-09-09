// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axiosInstance from './utils/axiosInstance';
const server = import.meta.env.VITE_API_URL;

// Your web app's Firebase configuration
// REPLACE THIS WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyCHlP71q9ZQ9O_ozA1DUo3Xb5wBkKE7xf8",
  authDomain: "quickmeet-af798.firebaseapp.com",
  projectId: "quickmeet-af798",
  storageBucket: "quickmeet-af798.firebasestorage.app",
  messagingSenderId: "497787112271",
  appId: "1:497787112271:web:c63e40499f9b754d5a933a",
  measurementId: "G-XQ5KWW52S8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Use your VAPID key here
// Use your VAPID key here
const VAPID_KEY = "BPh9D2uKof2k_MehDVOEMS6f6-Kjn7QTMOvuk0uW-s0h2UHAjwnJGYFv_Y7wtqXv8ApXKlHZqZcrp4f_yc7I36g";

let isRegistering = false;

export const requestForToken = async () => {
  if (isRegistering) {
    console.log('FCM: Already registering, skipping duplicate request.');
    return;
  }

  isRegistering = true;
  try {
    console.log('FCM: Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('FCM: Notification permission status:', permission);
    
    if (permission !== 'granted') {
      console.warn('FCM: Permission not granted.');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.error('FCM: Service workers are not supported in this browser.');
      return;
    }

    console.log('FCM: Checking service worker registration...');
    let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    
    if (!registration) {
      console.log('FCM: No existing registration found, registering new one...');
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
    }

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    // Ensure it's active
    if (registration.active) {
      console.log('FCM: Service worker active.');
    } else {
      console.log('FCM: Waiting for service worker to become active...');
      await new Promise((resolve) => {
        const sw = registration.installing || registration.waiting;
        if (sw) {
          sw.addEventListener('statechange', (e) => {
            if (e.target.state === 'activated') {
              console.log('FCM: Service worker activated successfully.');
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    }

    console.log('FCM: Requesting token...');
    try {
      const currentToken = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });
      
      if (currentToken) {
        console.log('FCM: Token generated successfully:', currentToken);
        const userToken = localStorage.getItem('token');
        if (userToken) {
          try {
            console.log('FCM: Updating backend with token...');
            const response = await axiosInstance.post(`/api/v1/users/update_fcm_token`, {
              fcm_token: currentToken
            });
            console.log('FCM: Backend updated successfully:', response.data);
          } catch (apiErr) {
            console.error('FCM: Failed to update backend:', apiErr.response?.data || apiErr.message);
          }
        } else {
          console.warn('FCM: User token not found in localStorage, skipping backend update.');
        }
        return currentToken;
      }
    } catch (tokenErr) {
      console.error('FCM: Token request failed:', tokenErr);
      
      const isBrave = !!(navigator.brave && await navigator.brave.isBrave());
      if (isBrave) {
        console.error('FCM ERROR: Brave detected. Please go to brave://settings/google_services and enable "Use Google services for push messaging", then fully restart Brave.');
      }

      if (tokenErr.message.includes('could not retrieve the public key') || tokenErr.name === 'AbortError') {
        console.error('FCM ERROR: This is a browser-level failure. It usually means the Push Service is blocked by your browser/VPN or the VAPID key is invalid for this project.');
      }
      throw tokenErr;
    }
  } catch (err) {
    console.error('FCM: Fatal error during registration/token request:', err);
  } finally {
    isRegistering = false;
  }
};

export const onMessageListener = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log('Received foreground message:', payload);
    if (callback) callback(payload);
  });
};
