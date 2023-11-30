// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPCUHstLwFZ-rFu_ZQLNcR2rRV529Qex8",
  authDomain: "addtocart-f2f87.firebaseapp.com",
  projectId: "addtocart-f2f87",
  storageBucket: "addtocart-f2f87.appspot.com",
  messagingSenderId: "420577338240",
  appId: "1:420577338240:web:1907176b3b306294d7d765",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
//vars
