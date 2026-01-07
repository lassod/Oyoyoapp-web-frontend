import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//     measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
// };
//

const firebaseConfig = {
    apiKey: "AIzaSyANAMHbk7KlwMfZEfuI5wIY7eLSSq7K7Rk",
    authDomain: "oyoyo-event-stage.firebaseapp.com",
    databaseURL: "https://oyoyo-event-stage-default-rtdb.firebaseio.com",
    projectId: "oyoyo-event-stage",
    storageBucket: "oyoyo-event-stage.appspot.com",
    messagingSenderId: "785156776742",
    appId: "1:785156776742:web:935e474a859f14a9f957e7",
    measurementId: "G-D6XWG5RDYY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);


