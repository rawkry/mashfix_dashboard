importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);
const firebaseConfig = {
  apiKey: "AIzaSyAV0f6tTyScD__OxX0g7dYXvsW7yk7bhQ8",
  authDomain: "mashfix-27daf.firebaseapp.com",
  projectId: "mashfix-27daf",
  storageBucket: "mashfix-27daf.appspot.com",
  messagingSenderId: "750127891637",
  appId: "1:750127891637:web:3a66c0e7fbb114fc61aafc",
  measurementId: "G-QNWLVMZ824",
};
firebase.initializeApp(firebaseConfig);
const isSupported = firebase.messaging.isSupported();

if (isSupported) {
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: "./logo.png",
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
