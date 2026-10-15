import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import BackButton from "./components/BackButton";
import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    };

    fetchUsers();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      } else {
        return { key, direction: "asc" };
      }
    });
  };

  const filteredUsers = users
    .filter((user) => {
      const term = searchTerm.toLowerCase();
      return (
        user.nume?.toLowerCase().includes(term) ||
        user.prenume?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.telefon?.toLowerCase?.().includes(term)
      );
    })
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      if (!key) return 0;

      const aVal = a[key]?.toLowerCase?.() || "";
      const bVal = b[key]?.toLowerCase?.() || "";

      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const getSortSymbol = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <BackButton />
        <h2 className="admin-title">👥 Utilizatori înregistrați</h2>

        <input
          type="text"
          placeholder="🔍 Caută după nume, prenume, email sau telefon..."
          className="admin-search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("nume")}>
                  Nume {getSortSymbol("nume")}
                </th>
                <th onClick={() => handleSort("prenume")}>
                  Prenume {getSortSymbol("prenume")}
                </th>
                <th onClick={() => handleSort("email")}>
                  Email {getSortSymbol("email")}
                </th>
                <th onClick={() => handleSort("telefon")}>
                  Telefon {getSortSymbol("telefon")}
                </th>
                <th onClick={() => handleSort("role")}>
                  Rol {getSortSymbol("role")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "16px", color: "#999" }}>
                    Niciun utilizator găsit.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nume || "—"}</td>
                    <td>{user.prenume || "—"}</td>
                    <td>{user.email || "—"}</td>
                    <td>{user.telefon || "—"}</td>
                    <td>{user.role || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ◀ Înapoi
          </button>
          <span>Pagina {currentPage} din {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Înainte ▶
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
