import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Autentificare reușită!", {
        position: "top-center",
        autoClose: 2500,
        theme: "colored",
      });
      setTimeout(() => navigate("/"), 2500);
    } catch (error) {
      toast.error("❌ Eroare: " + error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        const [nume, prenume] = user.displayName?.split(" ") || ["", ""];
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          nume,
          prenume,
          telefon: "",
          role: "client",
        });
      }

      toast.success("Autentificat cu Google ✅", {
        position: "top-center",
        autoClose: 2500,
        theme: "colored",
      });

      setTimeout(() => navigate("/"), 2500);
    } catch (error) {
      toast.error("Eroare Google Login: " + error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="form-container">
      <ToastContainer />
      <div className="form-card">
        <h2 className="form-title">Autentificare</h2>
        <form onSubmit={handleLogin}>
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
          <button type="submit" className="form-button">
            Autentificare
          </button>
        </form>

        <hr style={{ margin: "20px 0" }} />

        <button onClick={handleGoogleLogin} className="form-button" style={{ backgroundColor: "#DB4437" }}>
           Continuă cu Google
        </button>

        <Link to="/register" className="form-link">
          Nu ai cont? Înregistrează-te aici
        </Link>
      </div>
    </div>
  );
}

export default Login;
