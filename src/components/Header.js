import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNotifications } from "../hooks/useNotifications";
import "./Header.css";

function Header() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");

  if (!currentUser || !userData) return null;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/restaurante?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <header className="appHeader">
      <div className="headerContent">

        {}
        <div className="leftSection">
          {}
          <Link to="/notificari" className="iconButton" title="Notificări">
            <svg fill="#FACC15" viewBox="0 0 24 24">
              <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </Link>

          {}
          <Link to="/profil-cont" className="iconButton" title="Profil">
            <svg fill="#4B5563" viewBox="0 0 24 24">
              <path d="M12 12c2.67 0 8 1.34 8 4v4H4v-4c0-2.66 5.33-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            </svg>
          </Link>
        </div>

        {}
        {location.pathname !== "/login" && location.pathname !== "/register" && (
          <div className="centerSection">
            <input
              type="text"
              placeholder="Caută restaurante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="searchInput"
            />
            <button onClick={handleSearch} className="searchButton" title="Caută">
              <svg fill="white" viewBox="0 0 24 24" width="16" height="16">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 
                         C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 
                         5.91 16 9.5 16a6.5 6.5 0 0 0 
                         4.23-1.57l.27.28v.79l5 4.99L20.49 
                         19l-4.99-5zm-6 0C7.01 14 5 11.99 
                         5 9.5S7.01 5 9.5 5 14 7.01 
                         14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
        )}

        {}
        <div className="rightSection">
          <span className="userInfo">
            {userData.nume || currentUser.email} ({userData.role})
          </span>
          <button onClick={handleLogout} className="logoutButton">
            Ieșire
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
