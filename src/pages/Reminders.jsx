import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { reminderService } from '../services/reminderService'
import { vehicleService } from '../services/vehicleService'

export default function Reminders() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    label: '',
    due_mileage: '',
    due_date: '',
  })
  const [error, setError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [vehicleData, remindersData] = await Promise.all([
        vehicleService.getById(id),
        reminderService.getAll(id),
      ])
      setVehicle(vehicleData)
      setReminders(remindersData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    try {
      await reminderService.create(id, {
        label: form.label,
        due_mileage: form.due_mileage ? parseInt(form.due_mileage) : null,
        due_date: form.due_date || null,
      })
      setForm({ label: '', due_mileage: '', due_date: '' })
      setShowForm(false)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setFormLoading(false)
    }
  }

  const handleMarkDone = async (reminderId) => {
    try {
      await reminderService.markDone(id, reminderId)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (reminderId) => {
    if (!confirm('Supprimer ce rappel ?')) return
    try {
      await reminderService.delete(id, reminderId)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>

  const pending = reminders.filter(r => !r.done)
  const done = reminders.filter(r => r.done)

  return (
    <div className="min-h-screen bg-[#f4f3ef]">

      {/* Header */}
      <div className="bg-dark px-5 pt-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to={`/vehicles/${id}`} className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <div>
              <h2 className="font-sora text-lg font-bold text-white">Rappels d'entretien</h2>
              <p className="text-xs text-gray-400">{vehicle?.brand} {vehicle?.model} · {vehicle?.current_mileage?.toLocaleString()} km</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white font-sora font-semibold px-4 py-2 rounded-xl text-sm"
          >
            + Ajouter
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Formulaire ajout */}
        {showForm && (
          <div className="bg-white rounded-2xl p-5 border border-black/5">
            <h3 className="font-sora font-bold text-dark mb-4">Nouveau rappel</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Type d'entretien *</label>
                <select
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Choisir...</option>
                  <option value="Vidange">Vidange</option>
                  <option value="Filtre à air">Filtre à air</option>
                  <option value="Filtre à carburant">Filtre à carburant</option>
                  <option value="Courroie de distribution">Courroie de distribution</option>
                  <option value="Pneus">Pneus</option>
                  <option value="Freins">Freins</option>
                  <option value="Batterie">Batterie</option>
                  <option value="Révision générale">Révision générale</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Kilométrage prévu
                  <span className="text-gray-400 ml-1">(optionnel)</span>
                </label>
                <input
                  type="number"
                  value={form.due_mileage}
                  onChange={(e) => setForm({ ...form, due_mileage: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder={`ex: ${(vehicle?.current_mileage || 0) + 5000}`}
                  min={vehicle?.current_mileage}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Date prévue
                  <span className="text-gray-400 ml-1">(optionnel)</span>
                </label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-500 font-sora font-semibold py-3 rounded-xl text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-primary text-white font-sora font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
                >
                  {formLoading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rappels en cours */}
        {pending.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-black/5">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8782A" strokeWidth="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <p className="font-sora font-semibold text-dark mb-1">Aucun rappel</p>
            <p className="text-sm text-gray-400 mb-4">Ajoutez des rappels pour ne rien oublier</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white font-sora font-semibold px-6 py-2.5 rounded-xl text-sm"
            >
              Ajouter un rappel
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((reminder) => (
              <div key={reminder.id} className={`bg-white rounded-2xl p-4 border ${
                reminder.is_overdue ? 'border-red-200' :
                reminder.is_urgent ? 'border-orange-200' :
                'border-black/5'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    reminder.is_overdue ? 'bg-red-50' :
                    reminder.is_urgent ? 'bg-orange-50' :
                    'bg-primary/10'
                  }`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke={reminder.is_overdue ? '#ef4444' : reminder.is_urgent ? '#f97316' : '#E8782A'}
                      strokeWidth="2"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-sora font-bold text-sm text-dark">{reminder.label}</p>
                      {reminder.is_overdue && (
                        <span className="bg-red-50 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-md">
                          En retard !
                        </span>
                      )}
                      {reminder.is_urgent && !reminder.is_overdue && (
                        <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-md">
                          Urgent
                        </span>
                      )}
                    </div>

                    {reminder.due_mileage && (
                      <p className="text-xs text-gray-400 mt-1">
                        Prévu à {reminder.due_mileage?.toLocaleString()} km
                        {reminder.km_remaining !== null && (
                          <span className={`ml-2 font-semibold ${
                            reminder.km_remaining < 0 ? 'text-red-500' :
                            reminder.km_remaining <= 500 ? 'text-orange-500' :
                            'text-gray-500'
                          }`}>
                            ({reminder.km_remaining < 0
                              ? `${Math.abs(reminder.km_remaining).toLocaleString()} km de retard`
                              : `encore ${reminder.km_remaining.toLocaleString()} km`
                            })
                          </span>
                        )}
                      </p>
                    )}

                    {reminder.due_date && (
                      <p className="text-xs text-gray-400 mt-1">
                        Prévu le {new Date(reminder.due_date).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleMarkDone(reminder.id)}
                    className="flex-1 bg-green-50 border border-green-200 text-green-700 font-sora font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Marquer effectué
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="w-10 h-9 bg-red-50 border border-red-100 text-red-400 rounded-xl flex items-center justify-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rappels effectués */}
        {done.length > 0 && (
          <div>
            <h3 className="font-sora text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
              Effectués ({done.length})
            </h3>
            <div className="space-y-2">
              {done.map((reminder) => (
                <div key={reminder.id} className="bg-white rounded-2xl p-4 border border-black/5 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-sora font-semibold text-sm text-dark line-through">{reminder.label}</p>
                        {reminder.due_mileage && (
                          <p className="text-xs text-gray-400">{reminder.due_mileage?.toLocaleString()} km</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="text-gray-300 hover:text-red-400"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-10"></div>
    </div>
  )
}