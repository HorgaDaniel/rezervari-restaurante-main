import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import BackButton from "./components/BackButton";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import emailjs from "@emailjs/browser";
import "react-day-picker/dist/style.css";
import "./RezervareForm.css";

const zileMap = {
  Monday: "Luni",
  Tuesday: "Marți",
  Wednesday: "Miercuri",
  Thursday: "Joi",
  Friday: "Vineri",
  Saturday: "Sâmbătă",
  Sunday: "Duminică",
};

function RezervareForm() {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    nrPersoane: "",
    data: null,
    ora: "",
    mesaj: "",
  });
  const [availableHours, setAvailableHours] = useState([]);
  const [rezervareEfectuata, setRezervareEfectuata] = useState(false);

  const fetchRestaurant = useCallback(async () => {
    try {
      const docRef = doc(db, "restaurants", restaurantId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setRestaurant(snap.data());
      }
    } catch (error) {
      console.error("Eroare la aducerea restaurantului:", error);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  useEffect(() => {
    if (!formData.data || !restaurant?.program) {
      setAvailableHours([]);
      return;
    }

    const jsDay = format(formData.data, "EEEE");
    const zi = zileMap[jsDay];
    const programZi = restaurant.program?.[zi];

    if (!programZi || !programZi.start || !programZi.end) {
      setAvailableHours([]);
      return;
    }

    const [startH, startM] = programZi.start.split(":").map(Number);
    const [endH, endM] = programZi.end.split(":").map(Number);

    const times = [];
    const now = new Date();
    const selectedDate = new Date(formData.data);

    const start = new Date(selectedDate);
    start.setHours(startH, startM, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(endH, endM, 0, 0);

    const cursor = new Date(start);
    while (cursor <= end) {
      if (!(format(now, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") && cursor <= now)) {
        times.push(
          cursor.toLocaleTimeString("ro-RO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        );
      }
      cursor.setMinutes(cursor.getMinutes() + 30);
    }

    setAvailableHours(times);
  }, [formData.data, restaurant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date) => {
    setFormData((prev) => ({ ...prev, data: date, ora: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nrPersoane, data, ora, mesaj } = formData;

    if (!currentUser) {
      toast.error("⚠️ Trebuie să fii autentificat pentru a face o rezervare!");
      return;
    }

    if (!nrPersoane || !data || !ora) {
      toast.error("⚠️ Completează toate câmpurile obligatorii!");
      return;
    }

    const persoaneInt = parseInt(nrPersoane);
    if (isNaN(persoaneInt) || persoaneInt < 1) {
      toast.error("⚠️ Numărul de persoane trebuie să fie minim 1!");
      return;
    }

    try {
      await addDoc(collection(db, "reservations"), {
        userId: currentUser.uid,
        restaurantId,
        nrPersoane: persoaneInt,
        data: format(data, "yyyy-MM-dd"),
        ora,
        mesaj: mesaj?.trim() || "",
        status: "activa",
        createdAt: serverTimestamp(),
      });

      await emailjs.send(
        "service_yh17har",
        "template_ihzp82u",
        {
          user_name: `${userData.nume} ${userData.prenume}`,
          email: currentUser.email,
          restaurant_name: restaurant?.nume || "Restaurant",
          date: format(data, "dd.MM.yyyy"),
          hour: ora,
          persons: persoaneInt,
        },
        "UWCsTjPWiXpNHfuUl"
      );

      setRezervareEfectuata(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Eroare salvare rezervare sau trimitere email:", error);
      toast.error("❌ Eroare la salvarea rezervării sau trimiterea emailului!");
    }
  };

  const disabledDays = { before: new Date().setHours(0, 0, 0, 0) };

  if (rezervareEfectuata) {
    return (
      <div className="backgroundStyle">
        <div className="successMessage">
          <h2>✅ Rezervarea a fost efectuată!</h2>
          <p>Veți primi un email de confirmare și veți fi redirecționat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backgroundStyle">
      <BackButton />
      <div className="containerStyle">
        <h2 className="titleStyle">
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ marginRight: 8 }}
            >
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
            </svg>
            Rezervă o masă
          </span>
        </h2>

        <form onSubmit={handleSubmit} className="formStyle">
          <label>Număr persoane *</label>
          <input
            type="number"
            name="nrPersoane"
            value={formData.nrPersoane}
            onChange={handleChange}
            min="1"
            className="inputStyle"
            required
          />

          <label>Data rezervării *</label>
          <div className="calendarCustom">
            <DayPicker
              mode="single"
              selected={formData.data}
              onSelect={handleDateSelect}
              disabled={disabledDays}
            />
          </div>

          <label>Ora rezervării *</label>
          <select
            name="ora"
            value={formData.ora}
            onChange={handleChange}
            className="inputStyle"
            required
          >
            <option value="">Selectează ora</option>
            {availableHours.map((h, idx) => (
              <option key={idx} value={h}>
                {h}
              </option>
            ))}
          </select>

          <label>Mesaj (opțional)</label>
          <textarea
            name="mesaj"
            value={formData.mesaj}
            onChange={handleChange}
            placeholder="Ai cerințe speciale?"
            className="inputStyle"
            style={{ height: "80px" }}
          />

          <button type="submit" className="buttonStyle">
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ marginRight: 8 }}
              >
                <path d="M4 8.25v7.5L10.5 12 4 8.25zM21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-1 2.59-7.5 4.91a1 1 0 0 1-1 0L3 8.59V8h17v.59z" />
              </svg>
              Rezervă acum
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default RezervareForm;
