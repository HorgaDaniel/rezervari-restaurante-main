import React from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";
import BackButton from "./components/BackButton";

function AdminDashboard() {
  return (
    <div className="admin-container">
      <div className="admin-card">
        <BackButton />
        <h1 className="admin-title">📊 Panou Administrator</h1>
        <p className="admin-subtitle">Alege o acțiune din listă:</p>

        <div className="admin-buttons">
          <Link to="/admin/users" className="admin-button">
            <span role="img" aria-label="users">👥</span>
            <span className="label">Utilizatori</span>
          </Link>
          <Link to="/admin/reservari" className="admin-button">
            <span role="img" aria-label="calendar">🗓️</span>
            <span className="label">Rezervări</span>
          </Link>
          <Link to="/adauga-restaurant" className="admin-button">
            <span role="img" aria-label="plus">➕</span>
            <span className="label">Adaugă restaurant</span>
          </Link>
          <Link to="/restaurante" className="admin-button">
            <span role="img" aria-label="list">📋</span>
            <span className="label">Restaurante</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
