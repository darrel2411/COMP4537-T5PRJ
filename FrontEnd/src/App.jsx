import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/LoginForm/Login";
import Main from "./pages/Main";
import NotFoundPage from './pages/NotFound/NotFoundPage';
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Register from "./pages/RegisterForm/Register";
import { UserProvider, useUser } from "./context/UserContext";


function App() {

  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  )
}

function AppRoutes() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/main" />} />

      {/* Block user with valid session */}
      <Route path="/login" element={user ? <Navigate to="/main" replace /> : < Login />} />
      <Route path="/register" element={user ? <Navigate to="/main" replace /> : <Register />} />

      {/* Protected routes (Valid session needed) */}
      <Route path="/main" element={
        <ProtectedRoute>
          <Main />
        </ProtectedRoute>
      } />

      {/* 404 Not found routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App
