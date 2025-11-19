import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { Button } from "../ui/button";

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
    <Button variant="destructive" onClick={handleLogout} className="">
      Log Out
    </Button>
  );
}

export default LogoutButton;
