import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import BackButton from "./components/BackButton";
import "./RestaurantDetails.css";
import ReviewList from "./ReviewList";

function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [recenzii, setRecenzii] = useState([]);
  const [showRecenzii, setShowRecenzii] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "restaurants", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setRestaurant(snap.data());
        } else {
          console.error("Restaurantul nu există.");
        }

        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("restaurantId", "==", id));
        const querySnapshot = await getDocs(q);
        const recenziiLista = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecenzii(recenziiLista);
      } catch (error) {
        console.error("Eroare la încărcarea datelor:", error);
      }
    };

    fetchData();
  }, [id]);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!restaurant) return <p className="loading-text">Se încarcă...</p>;

  const mediaRating =
    recenzii.length > 0
      ? (
          recenzii.reduce((acc, rev) => acc + Number(rev.rating || 0), 0) / recenzii.length
        ).toFixed(1)
      : null;

  return (
    <div className="restaurant-container">
      <BackButton />
      <div className="restaurant-header">
        <h1>{restaurant.nume}</h1>
        {mediaRating && (
          <span className="restaurant-rating">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffcc00" viewBox="0 0 24 24">
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.826 1.516 8.276L12 18.897l-7.452 4.511 1.516-8.276L0 9.306l8.332-1.151z"/>
            </svg>{" "}
            {mediaRating} / 5
          </span>
        )}
        <p className="restaurant-subtitle">
          {restaurant.tipBucatarie} • {restaurant.oras}
        </p>
      </div>

      <div className="image-wrapper">
        {restaurant.imagini?.map((img, i) => (
          <img key={i} src={img} alt={`img-${i}`} onClick={() => setSelectedImage(img)} />
        ))}
      </div>

      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-image">
            <img src={selectedImage} alt="Zoomed" />
          </div>
        </div>
      )}

      <p className="restaurant-description">{restaurant.descriere}</p>

      <p className="restaurant-address">
        <strong>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24" style={{ verticalAlign: "middle", marginRight: 4 }}>
            <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
          </svg>
        </strong>{" "}
        {restaurant.adresa}
        <button
          className="copy-button"
          onClick={() => copyToClipboard(restaurant.adresa, "adresa")}
          title="Copiază adresa"
        >
          {copiedField === "adresa" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#00e676" viewBox="0 0 24 24">
              <path d="M20.29 5.71a1 1 0 0 0-1.42 0L10 14.59l-4.29-4.3a1 1 0 1 0-1.42 1.42l5 5a1 1 0 0 0 1.42 0l10-10a1 1 0 0 0 0-1.42z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24">
              <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zM20 5H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 18H8V7h12v16z"/>
            </svg>
          )}
        </button>
      </p>

      <p className="restaurant-phone">
        <strong>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24" style={{ verticalAlign: "middle", marginRight: 4 }}>
            <path d="M6.62 10.79a15.07 15.07 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.05-.24c1.12.37 2.33.57 3.54.57a1 1 0 0 1 1 1v3.34a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.33a1 1 0 0 1 1 1c0 1.21.2 2.42.57 3.54a1 1 0 0 1-.24 1.05l-2.04 2.2z" />
          </svg>
        </strong>{" "}
        {restaurant.telefon}
        <button
          className="copy-button"
          onClick={() => copyToClipboard(restaurant.telefon, "telefon")}
          title="Copiază numărul"
        >
          {copiedField === "telefon" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#00e676" viewBox="0 0 24 24">
              <path d="M20.29 5.71a1 1 0 0 0-1.42 0L10 14.59l-4.29-4.3a1 1 0 1 0-1.42 1.42l5 5a1 1 0 0 0 1.42 0l10-10a1 1 0 0 0 0-1.42z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24">
              <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zM20 5H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 18H8V7h12v16z"/>
            </svg>
          )}
        </button>
      </p>

      <h3 className="section-title">🕒 Program:</h3>
      <ul className="program-list">
        {["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"].map((zi) => {
          const ore = restaurant.program?.[zi];
          return (
            <li key={zi}>
              <strong>{zi}:</strong>{" "}
              {ore?.start && ore?.end ? `${ore.start} - ${ore.end}` : "Închis"}
            </li>
          );
        })}
      </ul>

      <Link to={`/rezervare/${id}`} style={{ textDecoration: "none" }}>
        <button className="reserve-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24" style={{ verticalAlign: "middle", marginRight: 6 }}>
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 17H5V8h14z"/>
          </svg>
          Rezervă o masă
        </button>
      </Link>

      <button
        className="toggle-reviews-button"
        onClick={() => setShowRecenzii(!showRecenzii)}
      >
        {showRecenzii ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24" style={{ verticalAlign: "middle", marginRight: 6 }}>
              <path d="M7 14l5-5 5 5H7z"/>
            </svg>
            Ascunde recenziile
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24" style={{ verticalAlign: "middle", marginRight: 6 }}>
              <path d="M21 6h-2v9H5v2h14l4 4V6z"/><path d="M17 12V4a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12l4-4h10a2 2 0 0 0 2-2z"/>
            </svg>
            Afișează recenziile
          </>
        )}
      </button>

      <div className={`review-section ${showRecenzii ? "open" : ""}`}>
        {showRecenzii && (
          <>
            <h3 className="review-title">Recenzii ({recenzii.length}):</h3>
            {recenzii.length === 0 ? (
              <p>Acest restaurant nu are recenzii încă.</p>
            ) : (
              <ReviewList recenzii={recenzii} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default RestaurantDetails;
