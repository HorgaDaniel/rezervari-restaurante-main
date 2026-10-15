import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";
import BackButton from "./components/BackButton";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function ProfilCont() {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    telefon: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        nume: userData.nume || "",
        prenume: userData.prenume || "",
        telefon: userData.telefon || "",
      });
    }
  }, [userData]);

  if (!currentUser || !userData) {
    return <p style={loadingText}>Se încarcă datele contului...</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        nume: formData.nume,
        prenume: formData.prenume,
        telefon: formData.telefon,
      });
      await refreshUserData();
      setEditMode(false);
      toast.success("✅ Datele au fost actualizate!");
    } catch (error) {
      console.error("Eroare la salvare:", error);
      toast.error("❌ Eroare la salvarea datelor.");
    }
  };

  return (
    <div style={backgroundStyle}>
      <div style={cardWrapper}>
        <BackButton />
        <div style={cardStyle}>
          <h2 style={titleStyle}> Profilul Meu</h2>

          {editMode ? (
            <>
              <input
                type="text"
                name="nume"
                value={formData.nume}
                onChange={handleChange}
                placeholder="Nume"
                style={inputStyle}
              />
              <input
                type="text"
                name="prenume"
                value={formData.prenume}
                onChange={handleChange}
                placeholder="Prenume"
                style={inputStyle}
              />
              <input
                type="text"
                name="telefon"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="Telefon"
                style={inputStyle}
              />
              <button onClick={handleSave} style={saveButtonStyle}>
                💾 Salvează
              </button>
              <button onClick={() => setEditMode(false)} style={cancelButtonStyle}>
                ✖ Anulează
              </button>
            </>
          ) : (
            <>
              <div style={infoRow}><strong>Nume:</strong> <span>{userData.nume || "-"}</span></div>
              <div style={infoRow}><strong>Prenume:</strong> <span>{userData.prenume || "-"}</span></div>
              <div style={infoRow}><strong>Telefon:</strong> <span>{userData.telefon || "-"}</span></div>
              <div style={infoRow}><strong>Email:</strong> <span>{currentUser.email}</span></div>
              <div style={infoRow}><strong>Rol:</strong> <span>{userData.role || "-"}</span></div>
              <div style={infoRow}><strong>UID:</strong> <span style={uidStyle}>{currentUser.uid}</span></div>

              <button onClick={() => setEditMode(true)} style={editButtonStyle}>
                 Editează Profil
              </button>
            </>
          )}

          <p style={bottomText}>
            Toate datele sunt securizate 🔒
          </p>
        </div>
      </div>

      {}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
    </div>
  );
}

//  Style
const backgroundStyle = {
  minHeight: "100vh",
  background: "linear-gradient(to right, #667eea, #764ba2)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "40px",
};

const cardWrapper = {
  width: "100%",
  maxWidth: "500px",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "16px",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
  textAlign: "left",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "30px",
  fontWeight: "600",
  fontSize: "24px",
  color: "#333",
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
  fontSize: "16px",
  color: "#444",
};

const uidStyle = {
  fontSize: "12px",
  color: "#666",
  wordBreak: "break-word",
  maxWidth: "250px",
  textAlign: "right",
};

const editButtonStyle = {
  marginTop: "20px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
};

const saveButtonStyle = {
  marginTop: "20px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
};

const cancelButtonStyle = {
  marginTop: "10px",
  backgroundColor: "#e74c3c",
  color: "white",
  border: "none",
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const bottomText = {
  marginTop: "30px",
  textAlign: "center",
  fontSize: "13px",
  color: "#777",
};

const loadingText = {
  fontSize: "18px",
  textAlign: "center",
  marginTop: "100px",
  color: "#666",
};

export default ProfilCont;
