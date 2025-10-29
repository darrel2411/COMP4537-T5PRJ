import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import Main from "./pages/Main";
import SignUp from "./pages/Signup";


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/main" />} />
        <Route path="/login" element={< Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </Router>
  )
}

export default App
