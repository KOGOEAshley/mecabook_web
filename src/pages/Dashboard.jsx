import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { vehicleService } from '../services/vehicleService'
import api from '../services/api'
import { reminderService } from '../services/reminderService'
import { repairService } from '../services/repairService'
import ModeSwitcher from '../components/ModeSwitcher'
import NotificationBell from '../components/NotificationBell'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = authService.getUser()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSessions, setActiveSessions] = useState([])
  const [urgentReminders, setUrgentReminders] = useState([])
  const [pendingRepairs, setPendingRepairs] = useState([])


  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
  try {
    const data = await vehicleService.getAll()
    setVehicles(data)

    const urgent = await reminderService.getUrgent()
    setUrgentReminders(urgent)

    const pendingRes = await repairService.getPending()
    setPendingRepairs(pendingRes)

    // Charger les sessions actives
    const sessionsRes = await api.get('/sessions')
    const active = sessionsRes.data.filter(s => s.status === 'ACTIVE' || s.status === 'PENDING')
    setActiveSessions(active)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

const handleRevoke = async (sessionId) => {
  if (!confirm('Voulez-vous éjecter ce garagiste ?')) return
  try {
    await api.post(`/sessions/${sessionId}/revoke`)
    setActiveSessions(activeSessions.filter(s => s.id !== sessionId))
    alert('Garagiste éjecté avec succès.')
  } catch (err) {
    alert('Erreur lors de la révocation')
  }
}

  const handleLogout = async () => {
    await authService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef]">

      {/* Header */}
      <div className="bg-dark px-5 pt-5 pb-16">
        <div className="flex justify-between items-center mb-5">
  <h1 className="font-sora text-xl font-bold text-white">
    Méca<span className="text-primary">Book</span>
  </h1>
  <div className="flex items-center gap-2">
    <ModeSwitcher />
    {/* <button className="relative w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-dark"></span>
    </button> */}\
    <NotificationBell />
    <button
      onClick={handleLogout}
      className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center"
    >
      <span className="font-sora text-sm font-bold text-primary">
        {user?.full_name?.charAt(0).toUpperCase()}
      </span>
    </button>
  </div>
</div>
        
        <p className="text-gray-400 text-sm">Bonjour 👋</p>
        <p className="font-sora text-xl font-bold text-white mt-1">{user?.full_name}</p>
      </div>

      {/* Contenu */}
      <div className="px-4 -mt-10">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 border border-black/5">
            <p className="text-xs text-gray-400 mb-1">Véhicules</p>
            <p className="font-sora text-2xl font-bold text-dark">{vehicles.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-black/5">
            <p className="text-xs text-gray-400 mb-1">Interventions</p>
            <p className="font-sora text-2xl font-bold text-dark">
              {vehicles.reduce((acc, v) => acc + (v.repairs?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-black/5">
           <div className="text-xs text-gray-400 mb-1">Rappels entretien</div>
<div className="font-sora text-2xl font-bold text-primary">{urgentReminders.length}</div>
          </div>
        </div>
          {/* Sessions actives */}
{activeSessions.length > 0 && (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      <h2 className="font-sora text-base font-bold text-dark">
        Connexions en cours
      </h2>
    </div>
    {activeSessions.map((session) => (
      <div key={session.id} className="bg-white rounded-2xl p-4 border border-orange-100 mb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8782A" strokeWidth="1.5">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div>
              <p className="font-sora font-bold text-sm text-dark">
                {session.mechanic?.full_name || 'Mécanicien'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {session.vehicle?.brand} {session.vehicle?.model}
                <span className={`ml-2 font-semibold ${session.status === 'ACTIVE' ? 'text-green-600' : 'text-orange-500'}`}>
                  · {session.status === 'ACTIVE' ? 'En cours' : 'En attente'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => handleRevoke(session.id)}
            className="bg-red-50 border border-red-200 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-xl"
          >
            Éjecter
          </button>
        </div>
      </div>
    ))}
  </div>
)}

  {/* Interventions en attente */}
{pendingRepairs.length > 0 && (
  <Link to="/repairs/pending">
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
      </div>
      <div className="flex-1">
        <p className="font-sora font-bold text-sm text-dark">
          {pendingRepairs.length} intervention(s) à valider
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Appuyez pour voir et valider</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8782A" strokeWidth="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  </Link>
)}

{/* Mes véhicules */}
<div className="flex justify-between items-center mb-3"></div>
        {/* Mes véhicules */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-sora text-base font-bold text-dark">Mes véhicules</h2>
          <Link to="/vehicles/add" className="text-sm text-primary font-semibold">+ Ajouter</Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">Chargement...</div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-black/5">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8782A" strokeWidth="1.5">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <path d="M9 17h10a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z"/>
                <circle cx="7.5" cy="17.5" r="2.5"/>
                <circle cx="17.5" cy="17.5" r="2.5"/>
              </svg>
            </div>
            <p className="font-sora font-semibold text-dark mb-1">Aucun véhicule</p>
            <p className="text-sm text-gray-400 mb-4">Ajoutez votre premier véhicule</p>
            <Link
              to="/vehicles/add"
              className="inline-block bg-primary text-white font-sora font-semibold px-6 py-2.5 rounded-xl text-sm"
            >
              Ajouter un véhicule
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`}>
                <div className="bg-white rounded-2xl p-5 border border-black/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-sora font-bold text-dark">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{vehicle.year} · {vehicle.engine_type} · {vehicle.plate_number || 'Sans plaque'}</p>
                    </div>
                    <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      Bon état
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#f7f6f2] rounded-xl p-2.5">
                      <p className="text-[10px] text-gray-400">Kilométrage</p>
                      <p className="font-sora text-sm font-semibold text-dark mt-0.5">
                        {vehicle.current_mileage?.toLocaleString()} km
                      </p>
                    </div>
                    <div className="bg-[#f7f6f2] rounded-xl p-2.5">
                      <p className="text-[10px] text-gray-400">Interventions</p>
                      <p className="font-sora text-sm font-semibold text-dark mt-0.5">
                        {vehicle.repairs?.length || 0}
                      </p>
                    </div>
                    <div className="bg-[#f7f6f2] rounded-xl p-2.5">
                      <p className="text-[10px] text-gray-400">Couleur</p>
                      <p className="font-sora text-sm font-semibold text-dark mt-0.5">
                        {vehicle.color || '-'}
                      </p>
                    </div>
                  </div>
                  <button className="w-full mt-3 bg-primary text-white font-sora font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Générer un code d'accès
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      {/* Bottom Nav */}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-2 py-3 flex justify-around">
  <Link to="/" className="flex flex-col items-center gap-1">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#E8782A" stroke="#E8782A" strokeWidth="0">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
    <span className="text-[9px] font-semibold text-primary">Accueil</span>
  </Link>
  <Link to="/vehicles" className="flex flex-col items-center gap-1">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
      <path d="M9 17h10a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z"/>
    </svg>
    <span className="text-[9px] font-semibold text-gray-400">Véhicules</span>
  </Link>
  <Link to="/historique" className="flex flex-col items-center gap-1">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
    <span className="text-[9px] font-semibold text-gray-400">Historique</span>
  </Link>
  <Link to="/profil" className="flex flex-col items-center gap-1">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
    <span className="text-[9px] font-semibold text-gray-400">Profil</span>
  </Link>
</div>  

      <div className="h-20"></div>
    </div>
  )
}