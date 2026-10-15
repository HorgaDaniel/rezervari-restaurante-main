import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ requiredRole }) => {
  const { currentUser, userData, loading } = useAuth(); 

  if (loading) {
    
    return <div style={{ padding: 20 }}>Se verifică sesiunea...</div>;
  }

  if (currentUser && !userData) {
    return <div style={{ padding: 20 }}>Se încarcă datele utilizatorului...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userData?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
