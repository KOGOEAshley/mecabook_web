import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'

export default function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user_id, email } = location.state || {}

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authService.verifyOtp({ user_id, code })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 8C4 6.9 4.9 6 6 6H26C27.1 6 28 6.9 28 8V24C28 25.1 27.1 26 26 26H6C4.9 26 4 25.1 4 24V8Z" stroke="white" strokeWidth="2"/>
              <path d="M4 10L16 18L28 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="font-sora text-2xl font-bold text-white">Vérification email</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Code envoyé à <span className="text-primary">{email}</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">Vérifiez storage/logs/laravel.log</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Code OTP à 6 chiffres</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-3xl font-sora font-bold tracking-widest placeholder-gray-600 focus:outline-none focus:border-primary transition"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-orange-600 text-white font-sora font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}