import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import BackButton from "./components/BackButton";
import { toast } from "react-toastify";
import "./ProfilClient.css";
import emailjs from "@emailjs/browser";

function RecenzieForm() {
  const { reservationId } = useParams();
  const { currentUser, userData } = useAuth();
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [rating, setRating] = useState(5);
  const [comentariu, setComentariu] = useState("");
  const [loading, setLoading] = useState(true);
  const [existaRecenzie, setExistaRecenzie] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const rezRef = doc(db, "reservations", reservationId);
        const rezSnap = await getDoc(rezRef);
        if (rezSnap.exists()) {
          const data = rezSnap.data();
          setRestaurantId(data.restaurantId);
        }

        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("reservationId", "==", reservationId));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          setExistaRecenzie(true);
        }
      } catch (error) {
        console.error("Eroare la încărcarea datelor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) return;
      try {
        const restRef = doc(db, "restaurants", restaurantId);
        const restSnap = await getDoc(restRef);
        if (restSnap.exists()) {
          setRestaurantName(restSnap.data().nume);
        }
      } catch (err) {
        console.error("Eroare la obținerea restaurantului:", err);
      }
    };
    fetchRestaurant();
  }, [restaurantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "reviews"), {
        userId: currentUser.uid,
        restaurantId: restaurantId,
        reservationId: reservationId,
        numeUser: `${userData.nume} ${userData.prenume}`,
        rating,
        comentariu,
        dataRecenzie: serverTimestamp(),
      });

      //  EmailJS
      await emailjs.send(
        "service_yh17har",        // ID-ul serviciului tău
        "template_ihzp82u",       // ID-ul șablonului
        {
          user_name: `${userData.nume} ${userData.prenume}`,
          email: currentUser.email,
          restaurant_name: restaurantName,
          review: comentariu,
          rating: `${rating} / 5`
        },
        "UWCsTjPWiXpNHfuUl"       // Public key-ul tău
      );

      toast.success("⭐ Recenzie trimisă cu succes și email trimis!");
      navigate("/profil");
    } catch (error) {
      console.error("Eroare la trimiterea recenziei sau emailului:", error);
      toast.error("❌ Eroare la trimiterea recenziei sau emailului!");
    }
  };

  if (loading) return <p>Se încarcă...</p>;

  if (existaRecenzie) {
    return (
      <div style={{ padding: "20px" }}>
        <BackButton />
        <h2>Ai trimis deja o recenzie pentru această rezervare!</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <BackButton />
      <h2 style={{ marginBottom: "20px" }}>✍️ Scrie o recenzie</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
        <label>Rating:</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="review-input"
        >
          <option value={5}>⭐⭐⭐⭐⭐</option>
          <option value={4}>⭐⭐⭐⭐</option>
          <option value={3}>⭐⭐⭐</option>
          <option value={2}>⭐⭐</option>
          <option value={1}>⭐</option>
        </select>

        <label>Comentariu:</label>
        <textarea
          value={comentariu}
          onChange={(e) => setComentariu(e.target.value)}
          className="review-input"
          style={{ height: "100px" }}
          placeholder="Scrie părerea ta despre restaurant..."
        />

        <button type="submit" className="review-button">Trimite Recenzie</button>
      </form>
    </div>
  );
}

export default RecenzieForm;
