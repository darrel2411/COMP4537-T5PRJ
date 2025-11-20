import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import LogoutButton from "../auth/LogoutButton";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo on the left */}
          <div
            className="shrink-0 cursor-pointer"
            onClick={() => navigate("/main")}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-auto"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "inline";
              }}
            />
            <span className="text-xl font-bold hidden">Logo</span>
          </div>

          {/* Navigation links in the middle */}
          <div className="flex-1 flex justify-center gap-8">
            <button
              onClick={() => navigate("/main")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive("/main")
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate("/collections")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive("/collections")
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Collections
            </button>
          </div>

          {/* Logout button on the right (only if user is logged in) */}
          <div className="shrink-0">{user && <LogoutButton />}</div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
