import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";
import emailjs from "@emailjs/browser"; 

function Register() {
  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const phoneRegex = /^0\d{6,14}$/;
    if (!phoneRegex.test(telefon)) {
      toast.error("Numărul de telefon este invalid! Trebuie să înceapă cu 0 și să conțină doar cifre.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        nume,
        prenume,
        telefon,
        email,
        role: "client"
      });

      
      await emailjs.send(
        "service_yh17har",         // ID serviciului EmailJS
        "template_bun_venit",      // ID sablonului din EmailJS
        {
          user_name: `${nume} ${prenume}`,
          email: email
        },
        "UWCsTjPWiXpNHfuUl"        // Cheia publica EmailJS
      );

      toast.success("Înregistrare reușită!", {
        position: "top-center",
        autoClose: 2500,
        theme: "colored"
      });

      setTimeout(() => navigate("/"), 2500);
    } catch (error) {
      toast.error("Eroare: " + error.message, {
        position: "top-center",
        autoClose: 3500,
        theme: "colored"
      });
    }
  };

  return (
    <div className="form-container">
      <ToastContainer />
      <div className="form-card">
        <h2 className="form-title">Înregistrare</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            className="form-input"
            placeholder="Nume"
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            required
          />
          <input
            type="text"
            className="form-input"
            placeholder="Prenume"
            value={prenume}
            onChange={(e) => setPrenume(e.target.value)}
            required
          />
          <input
            type="text"
            className="form-input"
            placeholder="Telefon (ex: 07xxxxxxxx)"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value.replace(/\D/g, ""))}
            required
          />
          <input
            type="email"
            className="form-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-input"
            placeholder="Parolă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="form-button">Creează cont</button>
        </form>
        <Link to="/login" className="form-link">
          Ai deja cont? Autentifică-te aici
        </Link>
      </div>
    </div>
  );
}

export default Register;
