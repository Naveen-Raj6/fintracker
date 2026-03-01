import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomeDashboard from './features/dashboard/components/HomeDashboard';
import FinanceTracker from './features/expenses/components/FinanceTracker';
import HabitTracker from './features/habits/components/HabitTracker';
import FitnessTracker from './features/fitness/components/FitnessTracker';
import UpskillTracker from './features/upskill/components/UpskillTracker';
import Navbar from './components/Navbar';
import Login from './features/auth/components/Login';
import Register from './features/auth/components/Register';
import { useSelector } from 'react-redux';

function PrivateRoute({ children }) {
    const { user } = useSelector((state) => state.auth);
    return user ? (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-24">
                {children}
            </main>
        </div>
    ) : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <Routes>
                <Route path="/" element={<PrivateRoute><HomeDashboard /></PrivateRoute>} />
                <Route path="/finance" element={<PrivateRoute><FinanceTracker /></PrivateRoute>} />
                <Route path="/habits" element={<PrivateRoute><HabitTracker /></PrivateRoute>} />
                <Route path="/fitness" element={<PrivateRoute><FitnessTracker /></PrivateRoute>} />
                <Route path="/upskill" element={<PrivateRoute><UpskillTracker /></PrivateRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </div>
    </Router>
  )
}

export default App
