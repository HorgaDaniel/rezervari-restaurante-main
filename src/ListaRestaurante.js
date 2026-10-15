import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Link, useLocation } from "react-router-dom";
import BackButton from "./components/BackButton";
import { FiRefreshCw } from "react-icons/fi"; 

import "./ListaRestaurante.css";

function ListaRestaurante() {
  const [restaurante, setRestaurante] = useState([]);
  const [search, setSearch] = useState("");
  const [orasFilter, setOrasFilter] = useState("");
  const [tipFilter, setTipFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortare, setSortare] = useState("");

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQueryFromHeader = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    const fetchData = async () => {
      const restauranteSnap = await getDocs(collection(db, "restaurants"));
      const recenziiSnap = await getDocs(collection(db, "reviews"));

      const restauranteList = restauranteSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const recenziiList = recenziiSnap.docs.map(doc => doc.data());

      const restauranteCuRating = restauranteList.map(r => {
        const recenziiRestaurant = recenziiList.filter(rev => rev.restaurantId === r.id);
        const media =
          recenziiRestaurant.length > 0
            ? recenziiRestaurant.reduce((acc, cur) => acc + Number(cur.rating), 0) / recenziiRestaurant.length
            : 0;
        return { ...r, rating: media.toFixed(1) };
      });

      setRestaurante(restauranteCuRating);
    };

    fetchData();
  }, []);

  const restauranteFiltrate = restaurante
    .filter((r) => {
      const nume = r.nume.toLowerCase();
      const oras = r.oras.toLowerCase();
      const tip = r.tipBucatarie?.toLowerCase() || "";
      const searchText = search.toLowerCase() || searchQueryFromHeader;

      return (
        (nume.includes(searchText) || oras.includes(searchText) || tip.includes(searchText)) &&
        (orasFilter ? r.oras === orasFilter : true) &&
        (tipFilter ? r.tipBucatarie === tipFilter : true) &&
        (ratingFilter ? parseFloat(r.rating) >= parseFloat(ratingFilter) : true)
      );
    })
    .sort((a, b) => {
      if (sortare === "az") return a.nume.localeCompare(b.nume);
      if (sortare === "za") return b.nume.localeCompare(a.nume);
      return 0;
    });

  const oraseUnice = [...new Set(restaurante.map(r => r.oras))];
  const tipuriUnice = [...new Set(restaurante.map(r => r.tipBucatarie))];

  return (
    <div className="lista-background">
      <BackButton />
      <img src="/cutlery.png" alt="left" className="decoration-left" />
      <img src="/cutlery.png" alt="right" className="decoration-right" />

      <div className="lista-container">
        <h2 className="lista-title">🍽️ Restaurante disponibile</h2>
        <p className="lista-subtitle">Explorează restaurantele și fă o rezervare rapid.</p>

        <div className="filters-container">
          <input
            type="text"
            placeholder="🔍 Caută după nume..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-filter"
          />

          <select value={orasFilter} onChange={(e) => setOrasFilter(e.target.value)} className="input-filter">
            <option value="">Toate orașele</option>
            {oraseUnice.map((oras) => (
              <option key={oras} value={oras}>{oras}</option>
            ))}
          </select>

          <select value={tipFilter} onChange={(e) => setTipFilter(e.target.value)} className="input-filter">
            <option value="">Toate tipurile</option>
            {tipuriUnice.map((tip) => (
              <option key={tip} value={tip}>{tip}</option>
            ))}
          </select>

          <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="input-filter">
            <option value="">Toate ratingurile</option>
            <option value="4">Minim 4⭐</option>
            <option value="3">Minim 3⭐</option>
            <option value="2">Minim 2⭐</option>
            <option value="1">Minim 1⭐</option>
          </select>

          <select value={sortare} onChange={(e) => setSortare(e.target.value)} className="input-filter">
            <option value="">Sortare implicită</option>
            <option value="az">Sortare A-Z</option>
            <option value="za">Sortare Z-A</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setOrasFilter("");
              setTipFilter("");
              setRatingFilter("");
              setSortare("");
            }}
            className="reset-button"
          >
            <FiRefreshCw size={16} style={{ marginRight: 6 }} />
            Resetare
          </button>
        </div>

        <div className="restaurant-grid">
          {restauranteFiltrate.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "30px" }}>Nu am găsit restaurante.</p>
          ) : (
            restauranteFiltrate.map((r) => (
              <div key={r.id} className="restaurant-card">
                <img
                  src={r.imagini?.[0] || "https://via.placeholder.com/300x200?text=Restaurant"}
                  alt={r.nume}
                  className="restaurant-image"
                />
                <h3>{r.nume}</h3>
                <p className="desc">{r.tipBucatarie} • {r.oras}</p>
                {r.rating > 0 && <p style={{ color: "#f39c12" }}>⭐ {r.rating}</p>}
                <p className="desc">
                  {r.descriere?.substring(0, 100)}{r.descriere?.length > 100 ? "..." : ""}
                </p>
                <Link to={`/restaurant/${r.id}`}>
                  <button className="details-button">Vezi detalii</button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ListaRestaurante;
