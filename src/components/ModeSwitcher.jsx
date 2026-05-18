import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export default function ModeSwitcher() {
  const navigate = useNavigate()
  const user = authService.getUser()
  const activeMode = localStorage.getItem('activeMode') || 'OWNER'

  // N'afficher que si l'utilisateur a les deux rôles
  if (!user?.roles?.includes('OWNER') || !user?.roles?.includes('MECHANIC')) {
    return null
  }

  const switchMode = (mode) => {
    localStorage.setItem('activeMode', mode)
    navigate('/')
    window.location.reload()
  }

  return (
    <div className="flex items-center bg-white/10 rounded-xl p-1 gap-1">
      <button
        onClick={() => switchMode('OWNER')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sora font-semibold transition ${
          activeMode === 'OWNER'
            ? 'bg-primary text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        🚗 Proprio
      </button>
      <button
        onClick={() => switchMode('MECHANIC')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sora font-semibold transition ${
          activeMode === 'MECHANIC'
            ? 'bg-primary text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        🔧 Mécanicien
      </button>
    </div>
  )
}