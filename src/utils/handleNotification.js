import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.reservationId
 * @param {string} params.tip 
 * @param {string} params.mesaj
 */
export async function handleNotification({ userId, reservationId, tip, mesaj }) {
  const notificariRef = collection(db, "notifications");

  const q = query(
    notificariRef,
    where("userId", "==", userId),
    where("reservationId", "==", reservationId),
    where("tip", "==", tip)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    await addDoc(notificariRef, {
      userId,
      reservationId,
      tip,
      mesaj,
      vazut: false,
      createdAt: serverTimestamp(),
    });
    return true; // not adăugată
  }

  return false; // deja exista nu s-a adăugat
}
