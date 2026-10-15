import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBosusTUIbK2Ff8aiiPP_80DKgYKwuAklA",
  authDomain: "rezervarerestaurant.firebaseapp.com",
  projectId: "rezervarerestaurant",
  storageBucket: "rezervarerestaurant.appspot.com",
  messagingSenderId: "855159868494",
  appId: "1:855159868494:web:e7f4cd36b5eb6d0fb3871f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Persistența auth setată pe local storage!");
  })
  .catch((error) => {
    console.error("❌ Eroare la setarea persistenței:", error);
  });
