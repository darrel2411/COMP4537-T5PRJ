import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/LoginForm/Login";
// import Main from "./pages/Main";
import Landing from "./pages/LandingPage/Landing";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Register from "./pages/RegisterForm/Register";
import { UserProvider, useUser } from "./context/UserContext";
import Admin from "./pages/AdminPage/Admin";
import Collection from "./pages/Collection/Collection";

function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* <Route path="/" element={<Navigate to="/main" />} /> */}
      <Route
        path="/"
        element={
          user
            ? user.userTypeId === 1
              ? <Navigate to="/admin" replace />
              : <Navigate to="/main" replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* Block user with valid session */}
      <Route
        path="/login"
        // element={user ? <Navigate to="/main" replace /> : <Login />}
        element={
          user
            ? user.userTypeId === 1
              ? <Navigate to="/admin" replace />
              : <Navigate to="/main" replace />
            : <Login />
        }
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/main" replace /> : <Register />}
      />

      <Route
        path="/admin"
        // element={user?.userTypeId === 1 ? <Admin /> : <Navigate to="/main" replace />}
        element={
          loading ? (
            <div>Loading...</div>
          ) : user?.userTypeId === 1 ? (
            <Admin />
          ) : (
            <Navigate to="/main" replace />
          )
        }
      />

      {/* Protected routes (Valid session needed) */}
      <Route
        path="/main"
        element={
          <ProtectedRoute>
            <Landing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collections"
        element={
          <ProtectedRoute>
            <Collection />
          </ProtectedRoute>
        }
      />

      {/* 404 Not found routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
