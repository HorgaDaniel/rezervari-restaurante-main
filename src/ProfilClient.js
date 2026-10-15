import React, { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import BackButton from "./components/BackButton";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import "./ProfilClient.css";

function ProfilClient() {
  const { currentUser, userData } = useAuth();
  const [rezervari, setRezervari] = useState([]);
  const [formData, setFormData] = useState({});
  const [filtru, setFiltru] = useState("toate");
  const [recomandari, setRecomandari] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const rezervareRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      const rezervariRef = collection(db, "reservations");
      const q = query(rezervariRef, where("userId", "==", currentUser.uid));
      const snap = await getDocs(q);
      const lista = [];
      const frecventaRestaurante = {};

      for (const docItem of snap.docs) {
        const data = docItem.data();
        const id = docItem.id;

        const reviewsQ = query(
          collection(db, "reviews"),
          where("reservationId", "==", id)
        );
        const reviewsSnap = await getDocs(reviewsQ);
        const hasReview = !reviewsSnap.empty;

        let numeRestaurant = "Restaurant necunoscut";
        let imagineRestaurant = "";
        let restaurantId = data.restaurantId;

        try {
          const restaurantDoc = await getDoc(doc(db, "restaurants", restaurantId));
          if (restaurantDoc.exists()) {
            const restaurantData = restaurantDoc.data();
            numeRestaurant = restaurantData.nume;
            imagineRestaurant = restaurantData.imagini?.[0] || "";
          }
        } catch (err) {
          console.warn("Eroare la restaurant:", err);
        }

        lista.push({
          id,
          ...data,
          hasReview,
          numeRestaurant,
          imagineRestaurant,
          dataObj: new Date(data.data),
          restaurantId,
        });

        const key = `${restaurantId}|||${numeRestaurant}|||${imagineRestaurant}`;
        frecventaRestaurante[key] = (frecventaRestaurante[key] || 0) + 1;
      }

      lista.sort((a, b) => new Date(a.dataObj) - new Date(b.dataObj));
      setRezervari(lista);

      const recomandate = Object.entries(frecventaRestaurante)
        .map(([key, count]) => {
          const [id, nume, imagine] = key.split("|||");
          return { restaurantId: id, nume, imagine, count };
        })
        .filter((entry) => entry.count > 1)
        .sort((a, b) => b.count - a.count);

      setRecomandari(recomandate);

      const azi = new Date();
      const notificariRef = collection(db, "notifications");

      for (const rez of lista) {
        const dataRez = new Date(rez.data);
        const [h, m] = rez.ora.split(":").map(Number);
        dataRez.setHours(h, m);
        const diffInZile = Math.floor((dataRez - azi) / (1000 * 60 * 60 * 24));
        const mesaj = ` Lasă o recenzie pentru rezervarea ta din ${format(dataRez, "dd MMM")} la ${rez.numeRestaurant}`;

        if (diffInZile < 0 && !rez.hasReview) {
          const qNotif = query(
            notificariRef,
            where("userId", "==", currentUser.uid),
            where("reservationId", "==", rez.id),
            where("tip", "==", "recenzie")
          );
          const snapNotif = await getDocs(qNotif);
          if (snapNotif.empty) {
            await addDoc(notificariRef, {
              userId: currentUser.uid,
              mesaj,
              reservationId: rez.id,
              tip: "recenzie",
              vazut: false,
              createdAt: serverTimestamp(),
            });
            toast.warn(mesaj);
          }
        }
      }
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTo = params.get("scrollTo");
    if (scrollTo && rezervareRefs.current[scrollTo]) {
      rezervareRefs.current[scrollTo].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [location.search, rezervari]);

  const handleSubmit = async (e, reservationId, restaurantId) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "reviews"), {
        userId: currentUser.uid,
        restaurantId,
        reservationId,
        numeUser: `${userData.nume} ${userData.prenume}`,
        rating: formData[reservationId]?.rating || 5,
        comentariu: formData[reservationId]?.comentariu || "",
        dataRecenzie: serverTimestamp(),
      });

      toast.success("Recenzia a fost trimisă!");
      setRezervari((prev) =>
        prev.map((r) =>
          r.id === reservationId ? { ...r, hasReview: true } : r
        )
      );
    } catch (err) {
      toast.error("Eroare la trimiterea recenziei");
    }
  };

  const handleChange = (e, reservationId) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [reservationId]: {
        ...prev[reservationId],
        [name]: value,
      },
    }));
  };

  const isRezervareTrecuta = (dataStr, oraStr) => {
    const [h, m] = oraStr.split(":").map(Number);
    const dataRez = new Date(dataStr);
    dataRez.setHours(h, m, 0, 0);
    return new Date() > dataRez;
  };

  const filtrate = rezervari.filter((rez) => {
    if (filtru === "toate") return true;
    if (filtru === "faraRecenzie") return !rez.hasReview && isRezervareTrecuta(rez.data, rez.ora);
    if (filtru === "cuRecenzie") return rez.hasReview;
    if (filtru === "viitoare") return !isRezervareTrecuta(rez.data, rez.ora);
    return true;
  });

  return (
    <div className="profile-background">
      <BackButton />
      <div className="profile-container">
        <h2 className="page-title">👤 Rezervările mele</h2>

        {recomandari.length > 0 && (
          <div className="recommendation-section">
            <h4>📌 Îți recomandăm din nou:</h4>
            <div className="recommendation-grid">
              {recomandari.map(({ nume, imagine, count, restaurantId }) => (
                <div
                  key={restaurantId}
                  className="recommendation-card"
                  onClick={() => navigate(`/restaurant/${restaurantId}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={imagine} alt={nume} className="recommendation-image" />
                  <strong>{nume}</strong>
                  <p className="recommendation-count">{count} rezervări</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="filter-bar">
          <select
            value={filtru}
            onChange={(e) => setFiltru(e.target.value)}
            className="filter-dropdown"
          >
            <option value="toate">Toate rezervările</option>
            <option value="faraRecenzie">Fără recenzie (trecute)</option>
            <option value="cuRecenzie">Cu recenzie</option>
            <option value="viitoare">Viitoare</option>
          </select>
        </div>

        {filtrate.map((rez) => (
          <div key={rez.id} className="reservation-card" ref={(el) => rezervareRefs.current[rez.id] = el}>
            <img
              src={rez.imagineRestaurant}
              alt={rez.numeRestaurant}
              className="reservation-image"
              onClick={() => navigate(`/restaurant/${rez.restaurantId}`)}
              style={{ cursor: "pointer" }}
            />
            <h3
              className="restaurant-title"
              onClick={() => navigate(`/restaurant/${rez.restaurantId}`)}
              style={{ cursor: "pointer" }}
            >
              {rez.numeRestaurant}
            </h3>
            <p><strong>Data:</strong> {format(new Date(rez.data), "dd MMM yyyy")}</p>
            <p><strong>Ora:</strong> {rez.ora}</p>
            <p><strong>Persoane:</strong> {rez.nrPersoane}</p>
            <p><strong>Status:</strong> {rez.status}</p>

            {!rez.hasReview && isRezervareTrecuta(rez.data, rez.ora) ? (
              <form onSubmit={(e) => handleSubmit(e, rez.id, rez.restaurantId)} className="review-form">
                <label><strong>Lasă o recenzie:</strong></label>
                <select
                  name="rating"
                  value={formData[rez.id]?.rating || 5}
                  onChange={(e) => handleChange(e, rez.id)}
                  className="review-input"
                >
                  {[5, 4, 3, 2, 1].map((val) => (
                    <option key={val} value={val}>{"⭐".repeat(val)}</option>
                  ))}
                </select>
                <textarea
                  name="comentariu"
                  value={formData[rez.id]?.comentariu || ""}
                  onChange={(e) => handleChange(e, rez.id)}
                  placeholder="Scrie o părere despre restaurant..."
                  className="review-input"
                />
                <button type="submit" className="review-button">Trimite recenzie</button>
              </form>
            ) : rez.hasReview ? (
              <p className="review-confirm">✅ Recenzie trimisă.</p>
            ) : (
              <p className="review-wait">🕒 Poți lăsa recenzie după ora rezervării.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfilClient;
