import { Routes, Route, Navigate } from 'react-router-dom'
import { authService } from './services/authService'

// Pages communes
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'

// Pages propriétaire
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import VehicleDetail from './pages/VehicleDetail'
import AddVehicle from './pages/AddVehicle'
import Historique from './pages/Historique'
import Profil from './pages/Profil'
import Reminders from './pages/Reminders'
import PendingRepairs from './pages/PendingRepairs'

// Pages garagiste
import GaragisteDashboard from './pages/GaragisteDashboard'

// Route protégée
const ProtectedRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />
}

// Route principale selon rôle actif
const HomeRoute = () => {
  if (!authService.isAuthenticated()) return <Navigate to="/login" />
  
  const user = authService.getUser()
  const activeMode = localStorage.getItem('activeMode')
  
  // Utilisateur avec les deux rôles
  if (user?.roles?.includes('OWNER') && user?.roles?.includes('MECHANIC')) {
    if (activeMode === 'MECHANIC') return <GaragisteDashboard />
    return <Dashboard />
  }
  
  // Utilisateur avec un seul rôle
  if (user?.role === 'MECHANIC') return <GaragisteDashboard />
  return <Dashboard />
}

export default function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* Route principale selon rôle */}
      <Route path="/" element={<HomeRoute />} />

      {/* Routes propriétaire */}
      <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
      <Route path="/vehicles/add" element={<ProtectedRoute><AddVehicle /></ProtectedRoute>} />
      <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetail /></ProtectedRoute>} />
      <Route path="/vehicles/:id/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
      <Route path="/historique" element={<ProtectedRoute><Historique /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
      <Route path="/repairs/pending" element={<ProtectedRoute><PendingRepairs /></ProtectedRoute>} />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}