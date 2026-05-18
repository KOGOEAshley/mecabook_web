import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { vehicleService } from '../services/vehicleService'

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll()
      setVehicles(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef]">

      <div className="bg-dark px-5 pt-5 pb-6 flex justify-between items-center">
        <h2 className="font-sora text-lg font-bold text-white">Mes véhicules</h2>
        <Link
          to="/vehicles/add"
          className="bg-primary text-white font-sora font-semibold px-4 py-2 rounded-xl text-sm"
        >
          + Ajouter
        </Link>
      </div>

      <div className="px-4 py-5 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Chargement...</div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-black/5">
            <p className="font-sora font-semibold text-dark mb-1">Aucun véhicule</p>
            <p className="text-sm text-gray-400 mb-4">Ajoutez votre premier véhicule</p>
            <Link to="/vehicles/add" className="inline-block bg-primary text-white font-sora font-semibold px-6 py-2.5 rounded-xl text-sm">
              Ajouter un véhicule
            </Link>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`}>
              <div className="bg-white rounded-2xl p-5 border border-black/5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-sora font-bold text-dark">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{vehicle.year} · {vehicle.plate_number || 'Sans plaque'}</p>
                  </div>
                  <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                    Actif
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#f7f6f2] rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400">Kilométrage</p>
                    <p className="font-sora text-sm font-semibold text-dark">{vehicle.current_mileage?.toLocaleString()} km</p>
                  </div>
                  <div className="flex-1 bg-[#f7f6f2] rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400">Interventions</p>
                    <p className="font-sora text-sm font-semibold text-dark">{vehicle.repairs?.length || 0}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      <div className="h-20"></div>
    </div>
  )
}