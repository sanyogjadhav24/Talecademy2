import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore,collection,addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBTw14Ev-lY_YQ0sPKVSk0h0iKl9nIabJk",
    authDomain: "newauth-b462d.firebaseapp.com",
    projectId: "newauth-b462d",
    storageBucket: "newauth-b462d.firebasestorage.app",
    messagingSenderId: "364511197052",
    appId: "1:364511197052:web:361239baa10cad1ec6d6f9",
    measurementId: "G-XTMNDY3T4E"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  export { auth, db,storage,collection,addDoc };