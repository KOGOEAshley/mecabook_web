import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { vehicleService } from '../services/vehicleService'
import api from '../services/api'

export default function VehicleDetail() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [shareCode, setShareCode] = useState(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [vehicleData, repairsData] = await Promise.all([
        vehicleService.getById(id),
        vehicleService.getRepairs(id),
      ])
      setVehicle(vehicleData)
      setRepairs(repairsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const generateCode = async () => {
    setGenerating(true)
    try {
      const response = await api.post('/sessions/generate', { vehicle_id: id })
      setShareCode(response.data.share_code)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>
  if (!vehicle) return <div className="min-h-screen flex items-center justify-center text-gray-400">Véhicule introuvable</div>

  return (
    <div className="min-h-screen bg-[#f4f3ef]">

      {/* Header */}
      <div className="bg-dark px-5 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/" className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <h2 className="font-sora text-lg font-bold text-white">{vehicle.brand} {vehicle.model}</h2>
            <p className="text-xs text-gray-400">{vehicle.year} · {vehicle.plate_number || 'Sans plaque'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 border border-white/8 rounded-xl p-3">
            <p className="text-[10px] text-gray-400">Kilométrage</p>
            <p className="font-sora text-sm font-bold text-white mt-0.5">{vehicle.current_mileage?.toLocaleString()} km</p>
          </div>
          <div className="bg-white/5 border border-white/8 rounded-xl p-3">
            <p className="text-[10px] text-gray-400">Moteur</p>
            <p className="font-sora text-sm font-bold text-white mt-0.5">{vehicle.engine_type}</p>
          </div>
          <div className="bg-white/5 border border-white/8 rounded-xl p-3">
            <p className="text-[10px] text-gray-400">Couleur</p>
            <p className="font-sora text-sm font-bold text-white mt-0.5">{vehicle.color || '-'}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Code de partage */}
        <div className="bg-white rounded-2xl p-5 border border-black/5">
          <h3 className="font-sora font-bold text-dark mb-3">Code d'accès garagiste</h3>

          {shareCode ? (
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-2">Code valide 24h</p>
              <div className="font-sora text-4xl font-bold text-dark tracking-widest mb-1">
                <span className="text-primary">{shareCode.slice(0, 3)}</span>{shareCode.slice(3)}
              </div>
              <p className="text-xs text-gray-400 mt-3">Donnez ce code à votre garagiste</p>
              <button
                onClick={() => navigator.clipboard.writeText(shareCode)}
                className="mt-3 text-primary text-sm font-semibold"
              >
                Copier le code
              </button>
            </div>
          ) : (
            <button
              onClick={generateCode}
              disabled={generating}
              className="w-full bg-primary text-white font-sora font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              {generating ? 'Génération...' : 'Générer un code d\'accès'}
            </button>
          )}

          <Link
  to={`/vehicles/${id}/reminders`}
  className="w-full mt-3 bg-white border border-primary/30 text-primary font-sora font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
  Rappels d'entretien
</Link>
        </div>

        {/* Historique */}
        <div>
          <h3 className="font-sora font-bold text-dark mb-3">Historique des interventions</h3>

          {repairs.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-black/5">
              <p className="text-sm text-gray-400">Aucune intervention enregistrée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {repairs.map((repair, index) => (
                <div key={repair.id} className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className={`w-3 h-3 rounded-full border-2 border-primary ${index === 0 ? 'bg-primary' : 'bg-[#f4f3ef]'}`}></div>
                    {index < repairs.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1"></div>}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-4 border border-black/5 mb-1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-sora font-bold text-sm text-dark">{repair.description}</p>
                      <span className="bg-[#f7f6f2] text-gray-500 text-xs px-2 py-0.5 rounded-lg font-medium">
                        {repair.mileage_at_repair?.toLocaleString()} km
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(repair.repair_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {repair.created_by && (
  <p className="text-xs text-primary mt-1">
    🔧 {repair.created_by.full_name}
    {repair.garage && ` · ${repair.garage.name}`}
  </p>
)}
                    </p>
                    {repair.parts_replaced && repair.parts_replaced.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {repair.parts_replaced.map((part, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md">
                            {part.name || part}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-md ${
                      repair.status === 'VALIDATED' ? 'bg-green-50 text-green-700' :
                      repair.status === 'PENDING_VALIDATION' ? 'bg-orange-50 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {repair.status === 'VALIDATED' ? 'Validée' :
                       repair.status === 'PENDING_VALIDATION' ? 'En attente' :
                       repair.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  )
}