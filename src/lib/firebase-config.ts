import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyANAMHbk7KlwMfZEfuI5wIY7eLSSq7K7Rk",
  authDomain: "oyoyo-event-stage.firebaseapp.com",
  projectId: "oyoyo-event-stage",
  storageBucket: "oyoyo-event-stage.appspot.com",
  messagingSenderId: "785156776742",
  appId: "1:785156776742:web:935e474a859f14a9f957e7",

  databaseURL: "https://oyoyo-event-stage-default-rtdb.firebaseio.com",
  measurementId: "G-D6XWG5RDYY",

  // apiKey: import.meta.env.VITE_API_KEY,
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
