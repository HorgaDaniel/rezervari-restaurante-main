import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Header from "./components/Header";
import "./HomePage.css";

function HomePage() {
  const { currentUser, userData } = useAuth();

  return (
    <>
      <Header />
      <div className="home-container">
        <img src="/cutlery.png" alt="Tacâmuri Stânga" className="cutlery-left" />
        <img src="/cutlery.png" alt="Tacâmuri Dreapta" className="cutlery-right" />

        <div className="home-card">
          <h1 className="home-title">
            🍽️ Bine ai venit în aplicația de rezervări!
          </h1>

          {!currentUser && (
            <>
              <p className="home-text">
                Te rugăm să te autentifici sau să creezi un cont.
              </p>
              <div className="home-buttons">
                <Link to="/login">
                  <button className="home-button primary">
                    🔐 Autentificare
                  </button>
                </Link>
                <Link to="/register">
                  <button className="home-button primary">
                    📝 Înregistrare
                  </button>
                </Link>
              </div>
            </>
          )}

          {currentUser && userData?.role === "admin" && (
            <>
              <h2 className="home-subtitle">
                👤 Bun venit, {userData.nume}!
              </h2>
              <div className="home-buttons center">
                <Link to="/admin">
                  <button className="home-button primary">
                    📋 Intră în Dashboard Admin
                  </button>
                </Link>
              </div>
            </>
          )}

          {currentUser && userData?.role === "client" && (
            <>
              <h2 className="home-subtitle">
                👤 Bun venit, {userData.nume}!
              </h2>
              <p className="home-subtitle">Alege o opțiune:</p>
              <div className="home-buttons">
                <Link to="/restaurante">
                  <button className="home-button primary">
                    🍽️ Restaurante disponibile
                  </button>
                </Link>
                <Link to="/profil">
                  <button className="home-button primary">
                    📂 Rezervările mele
                  </button>
                </Link>
                <Link to="/calendar">
                  <button className="home-button primary">
                    🗓️ Calendarul rezervărilor
                  </button>
                </Link>
                <Link to="/notificari">
                  <button className="home-button notification">
                    🔔 Notificările mele
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default HomePage;
