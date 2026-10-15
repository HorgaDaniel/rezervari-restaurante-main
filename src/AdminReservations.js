import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import BackButton from "./components/BackButton";
import "./AdminReservations.css";
import { FiRefreshCw } from "react-icons/fi";       //  reset
import { MdDeleteSweep } from "react-icons/md";     // ștergere

function AdminReservations() {
  const [rezervari, setRezervari] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRest, setFilterRest] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const rezervariSnap = await getDocs(collection(db, "reservations"));
      const usersSnap = await getDocs(collection(db, "users"));
      const restSnap = await getDocs(collection(db, "restaurants"));

      const usersMap = Object.fromEntries(usersSnap.docs.map(doc => [doc.id, doc.data()]));
      const restMap = Object.fromEntries(restSnap.docs.map(doc => [doc.id, doc.data()]));

      const lista = rezervariSnap.docs.map(docItem => {
        const data = docItem.data();
        const user = usersMap[data.userId] || {};
        const restaurant = restMap[data.restaurantId] || {};
        let status = (data.status || "").toLowerCase();

        if (status === "activa") status = "activă";
        if (status === "expirata") status = "expirată";
        if (status === "anulata") status = "anulată";

        const isExpired = new Date(data.data) < new Date() && status === "activă";
        if (isExpired) status = "expirată";

        return {
          id: docItem.id,
          ...data,
          userName: `${user.nume || ""} ${user.prenume || ""}`.trim(),
          telefon: user.telefon || "-",
          restaurantName: restaurant.nume || "Restaurant necunoscut",
          status: status,
          mesaj: data.mesaj || "-",
        };
      });

      setRezervari(lista);
    };

    fetchData();
  }, []);

  const rezervariFiltrate = rezervari.filter(r =>
    r.userName.toLowerCase().includes(search.toLowerCase()) &&
    (filterRest ? r.restaurantName === filterRest : true) &&
    (filterStatus ? r.status === filterStatus : true)
  );

  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentPageData = rezervariFiltrate.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(rezervariFiltrate.length / perPage);

  const handleAnuleaza = async (rezervare) => {
    try {
      await updateDoc(doc(db, "reservations", rezervare.id), { status: "anulată" });

      await addDoc(collection(db, "notifications"), {
        userId: rezervare.userId,
        mesaj: `Rezervarea ta la ${rezervare.restaurantName} din ${new Date(rezervare.data).toLocaleDateString("ro-RO")} ora ${rezervare.ora} a fost anulată.`,
        vazut: false,
        createdAt: serverTimestamp(),
      });

      setRezervari(prev =>
        prev.map(r => (r.id === rezervare.id ? { ...r, status: "anulată" } : r))
      );
    } catch (err) {
      console.error("Eroare anulare:", err);
    }
  };

  const deleteExpiredReservations = async () => {
    const expirate = rezervari.filter(r => r.status === "expirată");
    for (const rez of expirate) {
      await deleteDoc(doc(db, "reservations", rez.id));
    }
    setRezervari(rezervari.filter(r => r.status !== "expirată"));
  };

  const restauranteUnice = [...new Set(rezervari.map(r => r.restaurantName))];

  return (
    <div className="admin-container">
      <div className="admin-card">
        <BackButton />
        <h2 className="admin-title">📅 Rezervări</h2>

        <div className="admin-filters">
          <input
            type="text"
            placeholder="🔍 Caută client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filterRest} onChange={(e) => setFilterRest(e.target.value)}>
            <option value="">Toate restaurantele</option>
            {restauranteUnice.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Toate statusurile</option>
            <option value="activă">Activă</option>
            <option value="expirată">Expirată</option>
            <option value="anulată">Anulată</option>
          </select>

          <button className="minimal" onClick={() => {
            setSearch("");
            setFilterRest("");
            setFilterStatus("");
          }}>
            <FiRefreshCw size={16} style={{ marginRight: 6 }} />
            Resetare
          </button>

          <button className="minimal" onClick={deleteExpiredReservations}>
            <MdDeleteSweep size={18} style={{ marginRight: 6 }} />
            Șterge expirate
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Client</th>
                <th>Telefon</th>
                <th>Data & Ora</th>
                <th>Persoane</th>
                <th>Status</th>
                <th>Mesaj</th>
                <th>Acțiune</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.map(r => (
                <tr key={r.id}>
                  <td>{r.restaurantName}</td>
                  <td>{r.userName}</td>
                  <td>{r.telefon}</td>
                  <td>{r.data ? `${new Date(r.data).toLocaleDateString("ro-RO")} ${r.ora}` : "-"}</td>
                  <td style={{ textAlign: "center" }}>{r.nrPersoane}</td>
                  <td>{r.status}</td>
                  <td>{r.mesaj}</td>
                  <td>
                    {r.status === "activă" && (
                      <button className="anuleaza" onClick={() => handleAnuleaza(r)}>
                        Anulează
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {currentPageData.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "16px", color: "#888" }}>
                    Nicio rezervare găsită.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ⬅ Înapoi
          </button>
          <span>Pagina {currentPage} din {totalPages || 1}</span>
          <button
            disabled={currentPageData.length < perPage || currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Înainte ➡
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminReservations;
