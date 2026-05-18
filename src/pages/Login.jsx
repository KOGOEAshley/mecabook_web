import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authService.login(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion')
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
          <p className="text-gray-400 mt-2 text-sm">Connectez-vous à votre compte</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-orange-600 text-white font-sora font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}