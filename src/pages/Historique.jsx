import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { vehicleService } from '../services/vehicleService'

export default function Historique() {
  const [vehicles, setVehicles] = useState([])
  const [allRepairs, setAllRepairs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const vehiclesData = await vehicleService.getAll()
      setVehicles(vehiclesData)

      // Charger les repairs de tous les véhicules
      const repairsPromises = vehiclesData.map(v => vehicleService.getRepairs(v.id))
      const repairsArrays = await Promise.all(repairsPromises)

      // Fusionner et trier par date
      const allR = repairsArrays
        .flat()
        .map((repair, i) => ({
          ...repair,
          vehicle: vehiclesData.find(v => v.id === repair.vehicle_id)
        }))
        .sort((a, b) => new Date(b.repair_date) - new Date(a.repair_date))
         .filter(r => r.status !== 'CANCELLED' && r.status !== 'DRAFT')
        
      setAllRepairs(allR)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
    
    
  }

  const statusLabel = (status) => {
  switch (status) {
    case 'VALIDATED': return { label: '✓ Validée', color: 'bg-green-50 text-green-700' }
    case 'PENDING_VALIDATION': return { label: '⏳ En attente validation', color: 'bg-orange-50 text-orange-700' }
    case 'REJECTED': return { label: '✗ Refusée', color: 'bg-red-50 text-red-700' }
    case 'IN_PROGRESS': return { label: '🔧 En cours', color: 'bg-blue-50 text-blue-700' }
    case 'CANCELLED': return { label: '⊘ Annulée', color: 'bg-gray-100 text-gray-400' }
    case 'DRAFT': return { label: '📝 Brouillon', color: 'bg-gray-50 text-gray-500' }
    default: return { label: status, color: 'bg-gray-50 text-gray-500' }
  }
}

  return (
    <div className="min-h-screen bg-[#f4f3ef]">

      {/* Header */}
      <div className="bg-dark px-5 pt-5 pb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-sora text-xl font-bold text-white">
            Méca<span className="text-primary">Book</span>
          </h1>
        </div>
        <h2 className="font-sora text-xl font-bold text-white">Historique</h2>
        <p className="text-gray-400 text-sm mt-1">{allRepairs.length} intervention(s) au total</p>
      </div>

      <div className="px-4 py-5 -mt-3">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Chargement...</div>
        ) : allRepairs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-black/5">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8782A" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <p className="font-sora font-semibold text-dark mb-1">Aucune intervention</p>
            <p className="text-sm text-gray-400">Les interventions validées apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allRepairs.map((repair, index) => {
              const { label, color } = statusLabel(repair.status)
              return (
                <div key={repair.id} className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className={`w-3 h-3 rounded-full border-2 border-primary flex-shrink-0 ${index === 0 ? 'bg-primary' : 'bg-[#f4f3ef]'}`}></div>
                    {index < allRepairs.length - 1 && (
                      <div className="w-0.5 flex-1 bg-primary/20 mt-1 min-h-8"></div>
                    )}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-4 border border-black/5 mb-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-sora font-bold text-sm text-dark">{repair.description}</p>
                        <p className="text-xs text-primary font-semibold mt-0.5">
                          {repair.vehicle?.brand} {repair.vehicle?.model}
                        </p>
                      </div>
                      <span className="bg-[#f7f6f2] text-gray-500 text-xs px-2 py-0.5 rounded-lg font-medium whitespace-nowrap ml-2">
                        {repair.mileage_at_repair?.toLocaleString()} km
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(repair.repair_date).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                      {repair.created_by && (
  <p className="text-xs text-primary mt-1">
    🔧 {repair.created_by.full_name}
    {repair.garage && ` · ${repair.garage.name}`}
  </p>
)}
                    </p>

                    {repair.parts_replaced && repair.parts_replaced.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {repair.parts_replaced.map((part, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md">
                            {part.name || part}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md ${color}`}>
                      {label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-2 py-3 flex justify-around">
        <Link to="/" className="flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <span className="text-[9px] font-semibold text-gray-400">Accueil</span>
        </Link>
        <Link to="/vehicles" className="flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
            <path d="M9 17h10a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z"/>
          </svg>
          <span className="text-[9px] font-semibold text-gray-400">Véhicules</span>
        </Link>
        <Link to="/historique" className="flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#E8782A" stroke="#E8782A" strokeWidth="0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
          </svg>
          <span className="text-[9px] font-semibold text-primary">Historique</span>
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