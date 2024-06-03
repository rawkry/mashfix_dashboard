import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAV0f6tTyScD__OxX0g7dYXvsW7yk7bhQ8",
  authDomain: "mashfix-27daf.firebaseapp.com",
  projectId: "mashfix-27daf",
  storageBucket: "mashfix-27daf.appspot.com",
  messagingSenderId: "750127891637",
  appId: "1:750127891637:web:3a66c0e7fbb114fc61aafc",
  measurementId: "G-QNWLVMZ824",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;
