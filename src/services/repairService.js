import api from './api'

export const repairService = {
  // Valider une intervention
  approve: async (id) => {
    const response = await api.post(`/repairs/${id}/validate`)
    return response.data
  },

  // Refuser une intervention
  reject: async (id, reason) => {
    const response = await api.post(`/repairs/${id}/reject`, {
      rejection_reason: reason
    })
    return response.data
  },

  // Interventions en attente de validation
  getPending: async () => {
    const response = await api.get('/repairs/pending')
    return response.data
  },

  
}

export const getMyRepairs = async () => {
  const res = await api.get('/repairs/my-repairs');
  return res.data;
};