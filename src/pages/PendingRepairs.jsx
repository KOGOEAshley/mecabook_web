import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { repairService } from '../services/repairService'
import api from '../services/api'

export default function PendingRepairs() {
  const navigate = useNavigate()
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadPending()
  }, [])

  const loadPending = async () => {
    try {
      const data = await repairService.getPending()
      setRepairs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (repairId) => {
  const confirmed = window.confirm('Valider cette intervention ? Elle sera enregistrée définitivement.')
  if (!confirmed) return
  setActionLoading(true)
  try {
    await api.post(`/repairs/${repairId}/validate`)
    setRepairs(prev => prev.filter(r => r.id !== repairId))
    window.alert('Intervention validée avec succès !')
  } catch (err) {
    window.alert(err.response?.data?.message || 'Erreur lors de la validation')
  } finally {
    setActionLoading(false)
  }
}

  const handleReject = async () => {
  if (!rejectReason.trim()) return
  setActionLoading(true)
  try {
    await api.post(`/repairs/${rejectModal}/reject`, {
      rejection_reason: rejectReason
    })
    setRepairs(prev => prev.filter(r => r.id !== rejectModal))
    setRejectModal(null)
    setRejectReason('')
    window.alert('Intervention refusée.')
  } catch (err) {
    window.alert(err.response?.data?.message || 'Erreur lors du refus')
  } finally {
    setActionLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-[#f4f3ef]">

      {/* Header */}
      <div className="bg-dark px-5 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/" className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <h2 className="font-sora text-lg font-bold text-white">Interventions à valider</h2>
            <p className="text-xs text-gray-400">{repairs.length} en attente</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Chargement...</div>
        ) : repairs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-black/5">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="font-sora font-semibold text-dark mb-1">Tout est à jour !</p>
            <p className="text-sm text-gray-400">Aucune intervention en attente de validation</p>
          </div>
        ) : (
          repairs.map((repair) => (
            <div key={repair.id} className="bg-white rounded-2xl p-5 border border-orange-100">

              {/* Badge en attente */}
              <div className="flex justify-between items-start mb-4">
                <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                  En attente de validation
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(repair.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {/* Véhicule */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8782A" strokeWidth="1.5">
                    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                    <path d="M9 17h10a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-sora font-bold text-sm text-dark">
                    {repair.vehicle?.brand} {repair.vehicle?.model}
                  </p>
                  <p className="text-xs text-gray-400">{repair.vehicle?.plate_number || 'Sans plaque'}</p>
                </div>
              </div>

              {/* Détails intervention */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Description</span>
                  <span className="text-sm font-semibold text-dark">{repair.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Kilométrage</span>
                  <span className="text-sm font-semibold text-dark">{repair.mileage_at_repair?.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Mécanicien</span>
                  <span className="text-sm font-semibold text-primary">🔧 {repair.created_by?.full_name}</span>
                </div>
                {repair.garage && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Garage</span>
                    <span className="text-sm font-semibold text-dark">{repair.garage?.name}</span>
                  </div>
                )}
              </div>

              {/* Pièces remplacées */}
              {repair.parts_replaced && repair.parts_replaced.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Pièces remplacées</p>
                  <div className="flex flex-wrap gap-1.5">
                    {repair.parts_replaced.map((part, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md">
                        {part.name || part}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Boutons action */}
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectModal(repair.id)}
                  className="flex-1 border border-red-200 text-red-500 font-sora font-semibold py-3 rounded-xl text-sm"
                >
                  Refuser
                </button>
                <button
                  onClick={() => handleApprove(repair.id)}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 text-white font-sora font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
                >
                  ✓ Valider
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal refus */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-4 pb-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-sora font-bold text-dark text-lg mb-2">Motif du refus</h3>
            <p className="text-sm text-gray-400 mb-4">Expliquez pourquoi vous refusez cette intervention</p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 resize-none"
              rows={3}
              placeholder="Ex: Le kilométrage indiqué est incorrect..."
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="flex-1 border border-gray-200 text-gray-500 font-sora font-semibold py-3 rounded-xl text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 bg-red-500 text-white font-sora font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-10"></div>
    </div>
  )
}