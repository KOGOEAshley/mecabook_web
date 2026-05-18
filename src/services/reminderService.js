import api from './api'

export const reminderService = {
  // Liste des rappels d'un véhicule
  getAll: async (vehicleId) => {
    const response = await api.get(`/vehicles/${vehicleId}/reminders`)
    return response.data
  },

  // Créer un rappel
  create: async (vehicleId, data) => {
    const response = await api.post(`/vehicles/${vehicleId}/reminders`, data)
    return response.data
  },

  // Marquer comme fait
  markDone: async (vehicleId, id) => {
    const response = await api.post(`/vehicles/${vehicleId}/reminders/${id}/done`)
    return response.data
  },

  // Supprimer
  delete: async (vehicleId, id) => {
    const response = await api.delete(`/vehicles/${vehicleId}/reminders/${id}`)
    return response.data
  },

  // Rappels urgents pour dashboard
  getUrgent: async () => {
    const response = await api.get('/reminders/urgent')
    return response.data
  },
}