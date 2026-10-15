import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../firebase";

export const handleNotification = async ({
  userId,
  mesaj,
  tip = "general",
  reservationId = null,
  showToast = true,
}) => {
  try {
    const notificariRef = collection(db, "notifications");

    const conditions = [
      where("userId", "==", userId),
      where("tip", "==", tip),
    ];

    
    if (reservationId) {
      conditions.push(where("reservationId", "==", reservationId));
    } else {
      conditions.push(where("mesaj", "==", mesaj));
    }

    const notifQuery = query(notificariRef, ...conditions);
    const existingSnap = await getDocs(notifQuery);

    if (existingSnap.empty) {
      await addDoc(notificariRef, {
        userId,
        mesaj,
        tip,
        reservationId: reservationId || null,
        createdAt: serverTimestamp(),
      });

      if (showToast) {
        toast.warn(mesaj);
      }
    }
  } catch (error) {
    console.error("Eroare la handleNotification:", error);
  }
};
