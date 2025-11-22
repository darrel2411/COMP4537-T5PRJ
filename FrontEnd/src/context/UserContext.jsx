import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const API_BASE = import.meta.env.VITE_API_BASE;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/check-auth`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.ok) {
          setUser({
            email: data.email,
            name: data.name,
            userId: data.user_id,
            userTypeId: data.user_type_id,
            apiConsumption: data.api_consumption,
            score: data.score,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [API_BASE]);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
