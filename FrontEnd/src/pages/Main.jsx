import { useState } from "react";
import { useUser } from "../context/UserContext";

function Main() {
  const { user, setUser } = useUser();

  const API_BASE = import.meta.env.VITE_API_BASE;

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null); // clear context
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Hello, {user.name}! Click bellow to logout
        </h1>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </>
  );
}

export default Main;
