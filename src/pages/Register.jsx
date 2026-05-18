import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'OWNER',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await authService.register(form)
      navigate('/verify-otp', { state: { user_id: data.user_id, email: form.email } })
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 4C10.27 4 4 10.27 4 18C4 25.73 10.27 32 18 32C25.73 32 32 25.73 32 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="4" fill="white"/>
              <path d="M24 7L28 4L31 9L27 12Z" fill="white" opacity="0.7"/>
            </svg>
          </div>
          <h1 className="font-sora text-3xl font-bold text-white">
            Méca<span className="text-primary">Book</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Créez votre compte</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nom complet</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                placeholder="Amadou Traoré"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Mot de passe</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
  <label className="block text-sm text-gray-400 mb-2">Je suis</label>
  <div className="grid grid-cols-1 gap-3">
    {[
      { value: 'OWNER', label: '🚗 Propriétaire', desc: 'Je gère mes véhicules' },
      { value: 'MECHANIC', label: '🔧 Mécanicien', desc: 'Je fais des interventions' },
      { value: 'BOTH', label: '🚗🔧 Les deux', desc: 'Propriétaire et mécanicien' },
    ].map((option) => (
      <div
        key={option.value}
        onClick={() => setForm({ ...form, role: option.value })}
        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
          form.role === option.value
            ? 'border-primary bg-primary/10'
            : 'border-white/10 bg-white/5'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          form.role === option.value ? 'border-primary' : 'border-gray-500'
        }`}>
          {form.role === option.value && (
            <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
          )}
        </div>
        <div>
          <p className="font-sora font-semibold text-white text-sm">{option.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{option.desc}</p>
        </div>
      </div>
    ))}
  </div>
</div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-orange-600 text-white font-sora font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Inscription...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}