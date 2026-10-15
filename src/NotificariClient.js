import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";
import BackButton from "./components/BackButton";
import { useNavigate } from "react-router-dom";
import { FiEdit3 } from "react-icons/fi";

function NotificariClient() {
  const { currentUser } = useAuth();
  const [notificari, setNotificari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotificari = async () => {
      if (!currentUser) return;
      try {
        const notificariRef = collection(db, "notifications");
        const q = query(
          notificariRef,
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const lista = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNotificari(lista);
      } catch (error) {
        console.error("Eroare la încărcarea notificărilor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotificari();
  }, [currentUser]);

  const handleStergere = async (notificareId) => {
    try {
      await deleteDoc(doc(db, "notifications", notificareId));
      setNotificari((prev) => prev.filter((n) => n.id !== notificareId));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Eroare la ștergerea notificării:", error);
    }
  };

  const handleScrollTo = (rezId) => {
    navigate(`/profil?scrollTo=${rezId}`);
  };

  return (
    <div style={backgroundStyle}>
      <BackButton />
      <div style={cardStyle}>
        <h2>🔔 Notificările mele</h2>
        {loading ? (
          <p>Se încarcă notificările...</p>
        ) : notificari.length === 0 ? (
          <p>Nu ai notificări momentan.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {notificari.map((notificare) => (
              <li key={notificare.id} style={notifyStyle}>
                <span>{notificare.mesaj}</span>
                <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                  <button style={reviewBtnStyle} onClick={() => handleScrollTo(notificare.reservationId)}>
                    <FiEdit3 /> Lasă o recenzie
                  </button>
                  <button onClick={() => setConfirmDelete(notificare)} style={deleteBtnStyle}>🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {confirmDelete && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Confirmare ștergere</h3>
            <p>Sigur vrei să ștergi această notificare?</p>
            <div style={{ marginTop: "20px" }}>
              <button onClick={() => handleStergere(confirmDelete.id)} style={confirmBtnStyle}>Da, șterge</button>
              <button onClick={() => setConfirmDelete(null)} style={cancelBtnStyle}>Anulează</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const backgroundStyle = {
  minHeight: "100vh",
  background: "linear-gradient(to right, #667eea, #764ba2)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "40px",
};

const cardStyle = {
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
  textAlign: "center",
  maxWidth: "700px",
  width: "100%",
};

const notifyStyle = {
  backgroundColor: "#f8f8ff",
  marginBottom: "15px",
  padding: "20px",
  borderRadius: "10px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  position: "relative",
};

const reviewBtnStyle = {
  backgroundColor: "#6c63ff",
  color: "white",
  padding: "6px 16px",
  border: "none",
  borderRadius: "6px",
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const deleteBtnStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  backgroundColor: "transparent",
  border: "none",
  color: "#999",
  fontSize: "20px",
  cursor: "pointer",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modalStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  textAlign: "center",
  maxWidth: "400px",
  width: "90%",
};

const confirmBtnStyle = {
  backgroundColor: "#4caf50",
  color: "white",
  padding: "10px 20px",
  marginRight: "10px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const cancelBtnStyle = {
  backgroundColor: "#e63946",
  color: "white",
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default NotificariClient;
