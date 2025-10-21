import React, { createContext, useState, useEffect } from 'react';

// Création du contexte
export const AuthContext = createContext();

// Fournisseur du contexte (AuthProvider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simule la récupération d’un utilisateur sauvegardé
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        // Ici tu peux charger les infos depuis AsyncStorage ou ton API
        const storedUser = null; // À remplacer plus tard
        setUser(storedUser);
      } catch (err) {
        console.error('Erreur chargement utilisateur', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Méthodes pour login/logout
  const login = async (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
