import React, { useEffect, useState, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar-custom.css";
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";
import BackButton from "./components/BackButton";
import { Link } from "react-router-dom";
import { toast, Slide } from "react-toastify";

function CalendarPage() {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rezervari, setRezervari] = useState([]);
  const notifiedTodayRef = useRef(false);

  useEffect(() => {
    const fetch = async () => {
      if (!currentUser) return;

      const rezervariRef = collection(db, "reservations");
      const q = query(rezervariRef, where("userId", "==", currentUser.uid));
      const snap = await getDocs(q);
      const lista = [];

      for (const docItem of snap.docs) {
        const data = docItem.data();
        const id = docItem.id;

        let numeRestaurant = "Necunoscut";
        let restaurantId = data.restaurantId || null;
        let imagineRestaurant = "";

        if (restaurantId) {
          try {
            const restaurantRef = doc(db, "restaurants", restaurantId);
            const restaurantSnap = await getDoc(restaurantRef);
            if (restaurantSnap.exists()) {
              const restaurantData = restaurantSnap.data();
              numeRestaurant = restaurantData.nume || "Fără nume";
              imagineRestaurant = restaurantData.imagini?.[0] || "";
            }
          } catch (err) {
            console.warn("Eroare la obținerea restaurantului:", err);
          }
        }

        lista.push({
          id,
          ...data,
          restaurantId,
          numeRestaurant,
          imagineRestaurant,
          dataObj: new Date(data.data),
        });
      }

      setRezervari(lista);

      const azi = new Date().toDateString();
      if (!notifiedTodayRef.current) {
        const rezervariAzi = lista.filter(
          (rez) => rez.dataObj.toDateString() === azi
        );

        rezervariAzi.forEach((rez, index) => {
          setTimeout(() => {
            toast.info(
              `⏰ Ai o rezervare azi la ora ${rez.ora} la ${rez.numeRestaurant}`,
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                transition: Slide,
                theme: "colored",
              }
            );
          }, index * 1000);
        });

        if (rezervariAzi.length > 0) {
          notifiedTodayRef.current = true;
        }
      }
    };

    fetch();
  }, [currentUser]);

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const match = rezervari.some(
        (rez) => rez.dataObj.toDateString() === date.toDateString()
      );
      return match ? <span className="dot">🔔</span> : null;
    }
    return null;
  };

  const rezervariPeZi = rezervari.filter(
    (rez) => rez.dataObj.toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="calendar-page profile-background">
      <BackButton />

      <h2 style={{ textAlign: "center" }}>📅 Calendarul rezervărilor</h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          tileContent={tileContent}
        />
      </div>

      <h3 style={{ textAlign: "center" }}>
        Rezervări pe {selectedDate.toLocaleDateString()}:
      </h3>

      {rezervariPeZi.length === 0 ? (
        <p style={{ textAlign: "center" }}>Nu ai rezervări în această zi.</p>
      ) : (
        <div className="rezervari-list">
          {rezervariPeZi.map((rez) => (
            <Link to={`/restaurant/${rez.restaurantId}`} key={rez.id} className="rez-card-link">
              <div className="rez-card">
                <img
                  src={rez.imagineRestaurant || "/placeholder.png"}
                  alt={rez.numeRestaurant}
                  className="rez-img"
                />
                <div className="rez-info">
                  <h4>{rez.numeRestaurant}</h4>
                  <p>⏰ {rez.ora}</p>
                  <p>👥 {rez.nrPersoane} persoane</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
