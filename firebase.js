// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA341ZlG--oK1C6kxxYmkUwM4C0MYnBZxc",
  authDomain: "pantry-tracker-94d1c.firebaseapp.com",
  projectId: "pantry-tracker-94d1c",
  storageBucket: "pantry-tracker-94d1c.appspot.com",
  messagingSenderId: "846084681840",
  appId: "1:846084681840:web:96d0adfa69eec8251004b5",
  measurementId: "G-QRQG4K6CWS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
const storage = getStorage(app);
// const analytics = getAnalytics(app);
export {app, firestore, storage}