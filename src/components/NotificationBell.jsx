import { useState, useEffect, useRef } from 'react'
import { notificationService } from '../services/notificationService'

const typeConfig = {
  SESSION_REQUEST: { icon: '🔧', color: 'bg-orange-50 border-orange-200', label: 'Demande d\'accès' },
  SESSION_ACTIVATED: { icon: '✅', color: 'bg-green-50 border-green-200', label: 'Accès accordé' },
  SESSION_REVOKED: { icon: '🚫', color: 'bg-red-50 border-red-200', label: 'Accès révoqué' },
  REPAIR_SUBMITTED: { icon: '📋', color: 'bg-blue-50 border-blue-200', label: 'Intervention à valider' },
  REPAIR_VALIDATED: { icon: '✅', color: 'bg-green-50 border-green-200', label: 'Intervention validée' },
  REPAIR_REJECTED: { icon: '❌', color: 'bg-red-50 border-red-200', label: 'Intervention refusée' },
  MAINTENANCE_REMINDER: { icon: '⏰', color: 'bg-yellow-50 border-yellow-200', label: 'Rappel entretien' },
  MILEAGE_ALERT: { icon: '⚠️', color: 'bg-orange-50 border-orange-200', label: 'Alerte kilométrage' },
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (err) {}
  }

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await notificationService.getAll()
      setNotifications(data)
    } catch (err) {}
    finally { setLoading(false) }
  }

  const handleOpen = () => {
    setOpen(!open)
    if (!open) loadNotifications()
  }

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id)
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead()
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'À l\'instant'
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`
    return d.toLocaleDateString('fr-FR')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-black/5 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <div>
              <h3 className="font-sora font-bold text-dark text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400">{unreadCount} non lue(s)</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Tout lire
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-gray-400 text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const config = typeConfig[notif.type] || { icon: '📢', color: 'bg-gray-50 border-gray-200', label: '' }
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${!notif.read ? 'bg-orange-50/30' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 text-base ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.read ? 'font-semibold text-dark' : 'text-gray-600'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{notif.body}</p>
                      <p className="text-xs text-gray-300 mt-1">{formatDate(notif.created_at)}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}