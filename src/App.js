import React from "react";
import './styles/global-layout.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import HomePage from "./HomePage";
import Register from "./Register";
import Login from "./Login";
import Unauthorized from "./Unauthorized";

// Functionalitati utilizator autentificat
import ListaRestaurante from "./ListaRestaurante";
import RestaurantDetails from "./RestaurantDetails";
import RezervareForm from "./RezervareForm";
import ProfilClient from "./ProfilClient";
import NotificariClient from "./NotificariClient"; 
import ProfilCont from "./ProfilCont"; 
import CalendarPage from "./CalendarPage"; 

// Functionalitati admin
import PrivateRoute from "./PrivateRoute";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminReservations from "./AdminReservations";
import AddRestaurant from "./AddRestaurant";

// Notificari toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <>
        <Routes>
          {/*  rute publice */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/*  rute pentru utilizatori autentificati */}
          <Route element={<PrivateRoute />}>
            <Route path="/profil" element={<ProfilClient />} />
            <Route path="/profil-cont" element={<ProfilCont />} /> {}
            <Route path="/restaurante" element={<ListaRestaurante />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route path="/rezervare/:id" element={<RezervareForm />} />
            <Route path="/notificari" element={<NotificariClient />} />
            <Route path="/calendar" element={<CalendarPage />} /> {}
          </Route>

          {/*  rute pentru admin */}
          <Route element={<PrivateRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/reservari" element={<AdminReservations />} />
            <Route path="/adauga-restaurant" element={<AddRestaurant />} />
          </Route>
        </Routes>

        {/* toastify notificari */}
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </>
    </Router>
  );
}

export default App;
