import api from './api'

export const authService = {
  // Inscription
  register: async (data) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  // Vérification OTP
  verifyOtp: async (data) => {
    const response = await api.post('/auth/verify-otp', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  // Connexion
  login: async (data) => {
    const response = await api.post('/auth/login', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  // Déconnexion
  logout: async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Utilisateur connecté
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Vérifier si connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },
}