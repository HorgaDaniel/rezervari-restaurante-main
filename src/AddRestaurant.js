import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import BackButton from "./components/BackButton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddRestaurant.css";

const zileSaptamana = [
  "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică",
];

const generateOraOptions = () => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }
  }
  return options;
};

function AddRestaurant() {
  const [nume, setNume] = useState("");
  const [oras, setOras] = useState("");
  const [tipBucatarie, setTipBucatarie] = useState("");
  const [descriere, setDescriere] = useState("");
  const [adresa, setAdresa] = useState("");
  const [telefon, setTelefon] = useState("");
  const [imagini, setImagini] = useState("");
  const [program, setProgram] = useState(
    zileSaptamana.reduce((acc, zi) => {
      acc[zi] = { deschis: false, start: "", end: "" };
      return acc;
    }, {})
  );

  const oraOptions = generateOraOptions();

  const handleProgramChange = (zi, field, value) => {
    setProgram((prev) => ({
      ...prev,
      [zi]: {
        ...prev[zi],
        [field]: field === "deschis" ? value.target.checked : value,
      },
    }));
  };

  const isValidTelefon = (numar) => {
    const regex = /^07\d{8}$/;
    return regex.test(numar);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidTelefon(telefon)) {
      toast.error("⚠️ Număr invalid. Trebuie să înceapă cu 07 și să aibă 10 cifre.");
      return;
    }

    const programFiltrat = Object.fromEntries(
      Object.entries(program).filter(([_, val]) => val.deschis)
    );

    try {
      await addDoc(collection(db, "restaurants"), {
        nume,
        oras,
        tipBucatarie,
        descriere,
        adresa,
        telefon,
        imagini: imagini.split(",").map((img) => img.trim()),
        program: programFiltrat,
      });

      toast.success(" Restaurant salvat cu succes!");

          // Reset formular
      setNume("");
      setOras("");
      setTipBucatarie("");
      setDescriere("");
      setAdresa("");
      setTelefon("");
      setImagini("");
      setProgram(
        zileSaptamana.reduce((acc, zi) => {
          acc[zi] = { deschis: false, start: "", end: "" };
          return acc;
        }, {})
      );
    } catch (error) {
      toast.error("❌ Eroare la salvare: " + error.message);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <BackButton />
        <h2 className="admin-title">➕ Adaugă restaurant</h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <input placeholder="Nume" value={nume} onChange={(e) => setNume(e.target.value)} required />
          <input placeholder="Oraș" value={oras} onChange={(e) => setOras(e.target.value)} required />
          <input placeholder="Tip bucătărie" value={tipBucatarie} onChange={(e) => setTipBucatarie(e.target.value)} required />
          <textarea placeholder="Descriere" value={descriere} onChange={(e) => setDescriere(e.target.value)} />
          <input placeholder="Adresă" value={adresa} onChange={(e) => setAdresa(e.target.value)} />
          <input placeholder="Telefon (ex: 07xxxxxxxx)" value={telefon} onChange={(e) => setTelefon(e.target.value)} required />
          <input placeholder="Link-uri imagini (virgulă)" value={imagini} onChange={(e) => setImagini(e.target.value)} />

          <h4 className="program-title">📅 Program</h4>
          {zileSaptamana.map((zi) => (
            <div key={zi} className="program-line">
              <label className="zi-label">{zi}:</label>
              <input
                type="checkbox"
                checked={program[zi].deschis}
                onChange={(e) => handleProgramChange(zi, "deschis", e)}
              />
              {program[zi].deschis ? (
                <>
                  <select
                    value={program[zi].start}
                    onChange={(e) => handleProgramChange(zi, "start", e.target.value)}
                    className="ora-select"
                  >
                    <option value="">Start</option>
                    {oraOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <span>-</span>
                  <select
                    value={program[zi].end}
                    onChange={(e) => handleProgramChange(zi, "end", e.target.value)}
                    className="ora-select"
                  >
                    <option value="">End</option>
                    {oraOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </>
              ) : (
                <span style={{ color: "#888" }}>(închis)</span>
              )}
            </div>
          ))}

          <button type="submit" className="admin-button">Salvează restaurant</button>
        </form>
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </div>
    </div>
  );
}

export default AddRestaurant;
