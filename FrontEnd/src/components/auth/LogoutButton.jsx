import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

function LogoutButton() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const API_BASE = import.meta.env.VITE_API_BASE;

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
    >
      Log Out
    </button>
  );
}

export default LogoutButton;

