import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  //  actualizarea datelor utilizatorului
  const refreshUserData = useCallback(async () => {
    if (!currentUser) return;

    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        setUserData(null);
      }
    } catch (err) {
      console.error("Eroare la actualizarea datelor utilizatorului:", err);
      setUserData(null);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await refreshUserData();
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshUserData]); 

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
