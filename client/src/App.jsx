import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { useSelector } from 'react-redux';

function PrivateRoute({ children }) {
    const { user } = useSelector((state) => state.auth);
    return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <Routes>
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </div>
    </Router>
  )
}

export default App
