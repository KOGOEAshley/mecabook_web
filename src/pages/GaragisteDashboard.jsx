import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { notificationService } from '../services/notificationService'
import ModeSwitcher from '../components/ModeSwitcher'

// ─── Constantes ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  SESSION_REQUEST:      { icon: '🔧', color: 'bg-orange-50 border-orange-200' },
  SESSION_ACTIVATED:    { icon: '✅', color: 'bg-green-50 border-green-200'   },
  SESSION_REVOKED:      { icon: '🚫', color: 'bg-red-50 border-red-200'       },
  REPAIR_SUBMITTED:     { icon: '📋', color: 'bg-blue-50 border-blue-200'     },
  REPAIR_VALIDATED:     { icon: '✅', color: 'bg-green-50 border-green-200'   },
  REPAIR_REJECTED:      { icon: '❌', color: 'bg-red-50 border-red-200'       },
  MAINTENANCE_REMINDER: { icon: '⏰', color: 'bg-yellow-50 border-yellow-200' },
}

const STATUS_MAP = {
  VALIDATED:          { label: 'Validée',    color: 'bg-green-100 text-green-700'   },
  PENDING_VALIDATION: { label: 'En attente', color: 'bg-orange-100 text-orange-700' },
  IN_PROGRESS:        { label: 'En cours',   color: 'bg-blue-100 text-blue-700'     },
  REJECTED:           { label: 'Refusée',    color: 'bg-red-100 text-red-700'       },
  CANCELLED:          { label: 'Annulée',    color: 'bg-gray-100 text-gray-500'     },
}

// ─── NotificationBell ─────────────────────────────────────────────────────────
function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [open, setOpen]                   = useState(false)
  const [loading, setLoading]             = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    loadCount()
    const t = setInterval(loadCount, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadCount = async () => {
    try { setUnreadCount(await notificationService.getUnreadCount()) } catch {}
  }

  const handleOpen = async () => {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      try { setNotifications(await notificationService.getAll()) } catch {}
      finally { setLoading(false) }
    }
  }

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch {}
  }

  const markAll = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(ns => ns.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const ago = (d) => {
    const diff = Date.now() - new Date(d)
    if (diff < 60000)    return "À l'instant"
    if (diff < 3600000)  return `Il y a ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`
    return new Date(d).toLocaleDateString('fr-FR')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8782A] rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-black/5 z-50 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
              {unreadCount > 0 && <p className="text-xs text-gray-400">{unreadCount} non lue(s)</p>}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAll} className="text-xs text-[#E8782A] font-semibold hover:underline">
                Tout lire
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-gray-400 text-sm">Aucune notification</p>
              </div>
            ) : notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] || { icon: '📢', color: 'bg-gray-50 border-gray-200' }
              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${!n.read ? 'bg-orange-50/30' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 text-base ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{n.body}</p>
                    <p className="text-xs text-gray-300 mt-1">{ago(n.created_at)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 bg-[#E8782A] rounded-full flex-shrink-0 mt-1.5" />}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function GaragisteDashboard() {
  const navigate = useNavigate()

  // Session
  const [code, setCode]                     = useState('')
  const [session, setSession]               = useState(null)
  const [vehicle, setVehicle]               = useState(null)
  const [vehicleRepairs, setVehicleRepairs] = useState([])
  const [sessionRevoked, setSessionRevoked] = useState(false)
  const [claimLoading, setClaimLoading]     = useState(false)
  const [claimError, setClaimError]         = useState('')

  // Formulaire intervention
  const [showForm, setShowForm]       = useState(false)
  const [desc, setDesc]               = useState('')
  const [mileage, setMileage]         = useState('')
  const [parts, setParts]             = useState('')
  const [repairDate, setRepairDate]   = useState(new Date().toISOString().split('T')[0])
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError]     = useState('')

  // Profil
  const [tab, setTab]                       = useState('home')
  const [user, setUser]                     = useState(null)
  const [myRepairs, setMyRepairs]           = useState([])
  const [name, setName]                     = useState('')
  const [phone, setPhone]                   = useState('')
  const [savingProfile, setSavingProfile]   = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError]     = useState('')

  const pollingRef = useRef(null)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(u)
    setName(u.full_name || '')
    setPhone(u.phone || '')
    loadMyRepairs()
  }, [])

  useEffect(() => {
    if (session) {
      pollingRef.current = setInterval(checkSession, 5000)
    } else {
      clearInterval(pollingRef.current)
    }
    return () => clearInterval(pollingRef.current)
  }, [session])

  const loadMyRepairs = async () => {
    try {
      const res = await api.get('/repairs/my-repairs')
      setMyRepairs(res.data)
    } catch {}
  }

  const checkSession = async () => {
    if (!session) return
    try {
      const res = await api.get(`/sessions/${session.id}`)
      if (res.data.status === 'REVOKED' || res.data.status === 'COMPLETED') {
        clearInterval(pollingRef.current)
        setSession(null); setVehicle(null); setVehicleRepairs([])
        setShowForm(false); setSessionRevoked(true)
      }
    } catch {}
  }

  const handleClaim = async () => {
    if (code.length < 6) return
    setClaimLoading(true); setClaimError('')
    try {
      const res = await api.post('/sessions/claim', { share_code: code.toUpperCase() })
      const repairs = await api.get(`/vehicles/${res.data.vehicle.id}/repairs`)
      setSession(res.data.session); setVehicle(res.data.vehicle)
      setVehicleRepairs(repairs.data); setSessionRevoked(false); setCode('')
    } catch {
      setClaimError('Code invalide ou expiré. Vérifiez et réessayez.')
    } finally {
      setClaimLoading(false)
    }
  }

  const handleSubmitRepair = async (e) => {
    e.preventDefault()
    setFormLoading(true); setFormError('')
    try {
      const partsArr = parts.trim() ? parts.split(',').map(p => ({ name: p.trim() })) : []
      const repair = await api.post('/repairs', {
        vehicle_id:        vehicle.id,
        share_session_id:  session.id,
        mileage_at_repair: parseInt(mileage),
        description:       desc,
        repair_date:       repairDate,
        parts_replaced:    partsArr,
      })
      await api.post(`/repairs/${repair.data.id}/submit`)
      const updated = await api.get(`/vehicles/${vehicle.id}/repairs`)
      setVehicleRepairs(updated.data)
      await loadMyRepairs()
      setShowForm(false); setDesc(''); setMileage(''); setParts('')
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur. Vérifiez le kilométrage.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEndSession = async () => {
    if (!window.confirm('Terminer la session ?')) return
    try { await api.post(`/sessions/${session.id}/end`) } catch {}
    clearInterval(pollingRef.current)
    await loadMyRepairs()
    setSession(null); setVehicle(null); setVehicleRepairs([])
    setShowForm(false); setCode('')
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true); setProfileSuccess(''); setProfileError('')
    try {
      const res = await api.put('/auth/profile', { full_name: name, phone })
      localStorage.setItem('user', JSON.stringify(res.data))
      setUser(res.data); setProfileSuccess('Profil mis à jour !')
    } catch {
      setProfileError('Erreur lors de la mise à jour.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.clear(); navigate('/login')
  }

  const getStatus = (s) => STATUS_MAP[s] || { label: s, color: 'bg-gray-100 text-gray-500' }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#111827]">

      {/* ══ HEADER ══ */}
      <div className="bg-[#111827] border-b border-white/10 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="flex-1">
          <span className="text-white font-bold text-lg">Meca</span>
          <span className="text-[#E8782A] font-bold text-lg">Book</span>
          <span className="text-gray-400 text-xs ml-2">Garagiste</span>
        </div>
        <NotificationBell />
        <ModeSwitcher />
        <div className="bg-[#E8782A]/15 border border-[#E8782A]/30 rounded-lg px-3 py-1.5">
          <span className="text-[#E8782A] text-xs font-semibold">{user?.full_name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 hover:bg-red-500/20 transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>

      {/* ══ CONTENU ══ */}
      <div className="flex-1 overflow-y-auto">

        {/* ─── ACCUEIL ─── */}
        {tab === 'home' && (
          <div className="p-4 space-y-4">

            {/* Éjection */}
            {sessionRevoked && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">🚫</div>
                <p className="text-red-400 font-bold">Session terminée</p>
                <p className="text-gray-400 text-sm mt-1">Le propriétaire a mis fin à votre accès.</p>
                <button
                  onClick={() => setSessionRevoked(false)}
                  className="mt-3 text-[#E8782A] text-sm font-semibold hover:underline"
                >
                  Saisir un nouveau code
                </button>
              </div>
            )}

            {/* Saisie code */}
            {!session && !sessionRevoked && (
              <div className="space-y-4">
                <p className="text-gray-400 text-xs uppercase tracking-widest">Code client</p>

                {claimError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-sm">{claimError}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleClaim()}
                    maxLength={6}
                    placeholder="X7B9K2"
                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-2xl font-bold tracking-[0.4em] text-center focus:outline-none focus:border-[#E8782A] placeholder-gray-700 uppercase"
                  />
                  <button
                    onClick={handleClaim}
                    disabled={claimLoading || code.length < 6}
                    className="bg-[#E8782A] text-white font-bold px-5 rounded-xl disabled:opacity-50 hover:bg-[#d4691e] transition"
                  >
                    {claimLoading
                      ? <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>
                      : 'OK'
                    }
                  </button>
                </div>
                <p className="text-gray-500 text-xs text-center">
                  Demandez le code au propriétaire du véhicule
                </p>

                {/* Interventions récentes hors session */}
                <div className="pt-2">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">
                    Mes interventions récentes
                  </p>
                  {myRepairs.length === 0 ? (
                    <div className="bg-white/3 border border-white/8 rounded-xl p-5 text-center text-gray-500 text-sm">
                      Aucune intervention récente
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {myRepairs.slice(0, 5).map(r => {
                        const st = getStatus(r.status)
                        return (
                          <div key={r.id} className="bg-white/3 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.status === 'VALIDATED' ? 'bg-green-500' : 'bg-[#E8782A]'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm truncate">{r.description}</p>
                              <p className="text-gray-400 text-xs">{r.vehicle?.brand} {r.vehicle?.model}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                              <p className="text-gray-500 text-xs mt-0.5">{r.mileage_at_repair} km</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Session active */}
            {session && !showForm && (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/8 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-sm">Session en cours</span>
                    <div className="flex gap-2">
                      <span className="bg-green-500/15 border border-green-500/40 text-green-400 text-xs px-3 py-1 rounded-lg font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        En direct
                      </span>
                      <button
                        onClick={handleEndSession}
                        className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1 rounded-lg font-semibold hover:bg-red-500/20 transition"
                      >
                        Terminer
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#E8782A]/15 rounded-xl flex items-center justify-center text-xl">🚗</div>
                    <div>
                      <p className="text-white font-bold">{vehicle?.brand} {vehicle?.model}</p>
                      <p className="text-gray-400 text-xs">{vehicle?.year} · {vehicle?.current_mileage?.toLocaleString()} km</p>
                    </div>
                  </div>
                  <div className="bg-white/3 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-[#E8782A] text-sm">🔧</span>
                    <span className="text-gray-400 text-xs flex-1">{vehicleRepairs.length} intervention(s)</span>
                    <span className="text-[#E8782A] text-xs font-semibold">
                      {vehicleRepairs.length > 0 ? `Dernier: ${vehicleRepairs[0].mileage_at_repair} km` : 'Première visite'}
                    </span>
                  </div>
                </div>

                {vehicleRepairs.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Historique véhicule</p>
                    <div className="space-y-2">
                      {vehicleRepairs.slice(0, 5).map(r => (
                        <div key={r.id} className="bg-white/3 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
                          <div className="w-2 h-2 bg-[#E8782A] rounded-full flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{r.description}</p>
                            <p className="text-gray-500 text-xs">{r.repair_date?.slice(0, 10)}</p>
                          </div>
                          <span className="text-gray-400 text-xs flex-shrink-0">{r.mileage_at_repair} km</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setShowForm(true); setFormError('') }}
                  className="w-full bg-[#E8782A] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#d4691e] transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Créer une intervention
                </button>
              </div>
            )}

            {/* Formulaire intervention — champs directs, PAS de composant Field */}
            {session && showForm && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setShowForm(false); setFormError('') }}
                    className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                  <p className="text-white font-bold text-base">Nouvelle intervention</p>
                </div>

                {formError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-sm">{formError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitRepair} className="bg-white/5 border border-white/8 rounded-2xl p-4 space-y-4">

                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Description *</label>
                    <input
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      required
                      placeholder="Vidange complète + filtres"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E8782A] placeholder-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">
                      Kilométrage * (min : {vehicle?.current_mileage?.toLocaleString()} km)
                    </label>
                    <input
                      value={mileage}
                      onChange={e => setMileage(e.target.value)}
                      type="number"
                      min={vehicle?.current_mileage}
                      required
                      placeholder={String(vehicle?.current_mileage ?? '')}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E8782A] placeholder-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Date *</label>
                    <input
                      value={repairDate}
                      onChange={e => setRepairDate(e.target.value)}
                      type="date"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E8782A]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">
                      Pièces remplacées (séparées par virgules)
                    </label>
                    <input
                      value={parts}
                      onChange={e => setParts(e.target.value)}
                      placeholder="Huile 5W40, Filtre à huile, Filtre à air"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E8782A] placeholder-gray-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-[#E8782A] text-white font-bold py-4 rounded-xl hover:bg-[#d4691e] transition disabled:opacity-50 text-sm"
                  >
                    {formLoading ? 'Envoi en cours...' : 'Soumettre pour validation'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ─── PROFIL ─── */}
        {tab === 'profil' && (
          <div className="p-4 space-y-4">
            {/* Avatar */}
            <div className="text-center pt-4 pb-2">
              <div className="w-20 h-20 bg-[#E8782A] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-3xl font-bold">
                  {user?.full_name?.charAt(0).toUpperCase() || 'M'}
                </span>
              </div>
              <p className="text-white font-bold text-lg">{user?.full_name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="inline-block mt-2 bg-[#E8782A]/15 border border-[#E8782A]/30 text-[#E8782A] text-xs px-3 py-1 rounded-full font-semibold">
                Mécanicien
              </span>
            </div>

            {/* Stats */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4 grid grid-cols-3 divide-x divide-white/10">
              {[
                { icon: '🔧', label: 'Total',      value: myRepairs.length },
                { icon: '✅', label: 'Validées',   value: myRepairs.filter(r => r.status === 'VALIDATED').length },
                { icon: '⏳', label: 'En attente', value: myRepairs.filter(r => r.status === 'PENDING_VALIDATION').length },
              ].map(({ icon, label, value }) => (
                <div key={label} className="text-center px-2">
                  <div className="text-xl mb-1">{icon}</div>
                  <p className="text-white font-bold text-xl">{value}</p>
                  <p className="text-gray-400 text-xs">{label}</p>
                </div>
              ))}
            </div>

            {/* Interventions récentes sur le profil */}
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">
                Mes interventions récentes
              </p>
              {myRepairs.length === 0 ? (
                <div className="bg-white/3 border border-white/8 rounded-xl p-5 text-center text-gray-500 text-sm">
                  Aucune intervention pour l'instant
                </div>
              ) : (
                <div className="space-y-2">
                  {myRepairs.slice(0, 8).map(r => {
                    const st = getStatus(r.status)
                    return (
                      <div key={r.id} className="bg-white/3 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          r.status === 'VALIDATED' ? 'bg-green-500' :
                          r.status === 'PENDING_VALIDATION' ? 'bg-[#E8782A]' : 'bg-gray-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{r.description}</p>
                          <p className="text-gray-400 text-xs">
                            {r.vehicle?.brand} {r.vehicle?.model} · {r.repair_date?.slice(0, 10)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                            {st.label}
                          </span>
                          <p className="text-gray-500 text-xs mt-0.5">{r.mileage_at_repair} km</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modifier profil */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <p className="text-white font-bold text-sm mb-4">Modifier le profil</p>
              {profileSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-3">
                  <p className="text-green-400 text-sm">✅ {profileSuccess}</p>
                </div>
              )}
              {profileError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-3">
                  <p className="text-red-400 text-sm">{profileError}</p>
                </div>
              )}
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">Nom complet</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E8782A] placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1.5">Téléphone</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    type="tel"
                    placeholder="+226 70 00 00 00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E8782A] placeholder-gray-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-[#E8782A] text-white font-bold py-3 rounded-xl hover:bg-[#d4691e] transition disabled:opacity-50 text-sm"
                >
                  {savingProfile ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </form>
            </div>

            <button
              onClick={handleLogout}
              className="w-full border border-red-500/50 text-red-400 font-semibold py-3 rounded-xl hover:bg-red-500/10 transition text-sm"
            >
              Se déconnecter
            </button>
            <div className="h-4" />
          </div>
        )}
      </div>

      {/* ══ BOTTOM NAV ══ */}
      <div className="bg-[#0D1520] border-t border-white/10 flex flex-shrink-0">
        {[
          { id: 'home',   icon: '🏠', label: 'Accueil' },
          { id: 'profil', icon: '👤', label: 'Profil'  },
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition ${
              tab === id ? 'text-[#E8782A]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
