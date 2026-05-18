import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import api from '../services/api'

export default function Profil() {
  const navigate = useNavigate()
  const user = authService.getUser()

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const response = await api.put('/auth/profile', form)
      localStorage.setItem('user', JSON.stringify(response.data))
      setSuccess('Profil mis à jour avec succès !')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    navigate('/login')
  }

  const roleLabel = (role) => {
    switch (role) {
      case 'OWNER': return 'Propriétaire'
      case 'MECHANIC': return 'Mécanicien'
      case 'GARAGE_BOSS': return 'Patron de garage'
      default: return role
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef]">

      {/* Header */}
      <div className="bg-dark px-5 pt-5 pb-10">
        <h1 className="font-sora text-xl font-bold text-white mb-6">
          Méca<span className="text-primary">Book</span>
        </h1>

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-3">
            <span className="font-sora text-3xl font-bold text-white">
              {user?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="font-sora text-xl font-bold text-white">{user?.full_name}</h2>
          <span className="mt-2 bg-primary/20 border border-primary/40 text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {roleLabel(user?.role)}
          </span>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">

        {/* Infos compte */}
        <div className="bg-white rounded-2xl p-5 border border-black/5">
          <h3 className="font-sora font-bold text-dark mb-4">Informations du compte</h3>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-400">Email</span>
              <span className="text-sm font-medium text-dark">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-400">Rôle</span>
              <span className="text-sm font-medium text-dark">{roleLabel(user?.role)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-400">Email vérifié</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${user?.email_verified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {user?.email_verified ? 'Vérifié ✓' : 'Non vérifié'}
              </span>
            </div>
          </div>
        </div>

        {/* Modifier profil */}
        <div className="bg-white rounded-2xl p-5 border border-black/5">
          <h3 className="font-sora font-bold text-dark mb-4">Modifier le profil</h3>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Nom complet</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Téléphone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                placeholder="+226 70 00 00 00"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-sora font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-red-200 text-red-500 font-sora font-semibold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Se déconnecter
        </button>
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="text-[9px] font-semibold text-gray-400">Historique</span>
        </Link>
        <Link to="/profil" className="flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#E8782A" stroke="#E8782A" strokeWidth="0">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2h16zm-8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
          </svg>
          <span className="text-[9px] font-semibold text-primary">Profil</span>
        </Link>
      </div>

      <div className="h-20"></div>
    </div>
  )
}