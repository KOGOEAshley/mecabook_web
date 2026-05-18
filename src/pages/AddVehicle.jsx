import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { vehicleService } from '../services/vehicleService'

export default function AddVehicle() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vehicle_type: 'CAR',
    engine_type: 'PETROL',
    current_mileage: '',
    color: '',
    plate_number: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await vehicleService.create(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef]">

      {/* Header */}
      <div className="bg-dark px-5 pt-5 pb-6 flex items-center gap-3">
        <Link to="/" className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h2 className="font-sora text-lg font-bold text-white">Ajouter un véhicule</h2>
      </div>

      <div className="px-4 py-5">
        <div className="bg-white rounded-2xl p-6 border border-black/5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Marque *</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="Toyota"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Modèle *</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="Corolla"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Année *</label>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Couleur</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="Blanc"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Type de véhicule *</label>
              <select
                value={form.vehicle_type}
                onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="CAR">Voiture</option>
                <option value="MOTORCYCLE">Moto</option>
                <option value="TRUCK">Camion</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Type de moteur *</label>
              <select
                value={form.engine_type}
                onChange={(e) => setForm({ ...form, engine_type: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="PETROL">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Électrique</option>
                <option value="HYBRID">Hybride</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Kilométrage actuel *</label>
              <input
                type="number"
                value={form.current_mileage}
                onChange={(e) => setForm({ ...form, current_mileage: parseInt(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                placeholder="47500"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Plaque d'immatriculation
                <span className="text-gray-400 ml-1">(optionnel)</span>
              </label>
              <input
                type="text"
                value={form.plate_number}
                onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                placeholder="BF 2847 AL"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-orange-600 text-white font-sora font-semibold py-3.5 rounded-xl transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Création...' : 'Ajouter le véhicule'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}