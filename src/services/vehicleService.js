import api from './api'

export const vehicleService = {
  // Liste des véhicules
  getAll: async () => {
    const response = await api.get('/vehicles')
    return response.data
  },

  // Détail d'un véhicule
  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`)
    return response.data
  },

  // Créer un véhicule
  create: async (data) => {
    const response = await api.post('/vehicles', data)
    return response.data
  },

  // Modifier un véhicule
  update: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data)
    return response.data
  },

  // Historique interventions
  getRepairs: async (id) => {
    const response = await api.get(`/vehicles/${id}/repairs`)
    return response.data
  },
}