import api from './api'

export interface PredictionResult {
  predicted_class: string
  confidence: number
  all_predictions?: { [key: string]: number }
  disease_info?: {
    description: string
    symptoms: string[]
    treatment: string[]
    prevention: string[]
  }
  timestamp: string
}

export interface HistoryItem {
  id: string
  user_id: string
  image_url: string
  prediction: PredictionResult
  created_at: string
}

export interface Expert {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  location: string
  availability: string
  price: string
  image_url: string
  bio: string
}

// Plant Disease Prediction API
export const plantAPI = {
  // Predict plant disease
  predictDisease: async (imageFile: File): Promise<PredictionResult> => {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    const response = await api.post('/api/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  },

  // Get prediction history
  getHistory: async (): Promise<HistoryItem[]> => {
    const response = await api.get('/api/history')
    return response.data
  },

  // Save prediction to history
  saveToHistory: async (prediction: PredictionResult, imageFile: File): Promise<HistoryItem> => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('prediction', JSON.stringify(prediction))
    
    const response = await api.post('/api/history', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  },

  // Delete history item
  deleteHistoryItem: async (id: string): Promise<void> => {
    await api.delete(`/api/history/${id}`)
  },

  // Get disease information
  getDiseaseInfo: async (diseaseName: string) => {
    const response = await api.get(`/api/diseases/${encodeURIComponent(diseaseName)}`)
    return response.data
  },

  // Get all diseases
  getAllDiseases: async () => {
    const response = await api.get('/api/diseases')
    return response.data
  },
}

// Expert Connection API
export const expertAPI = {
  // Get available experts
  getExperts: async (): Promise<Expert[]> => {
    const response = await api.get('/api/experts')
    return response.data
  },

  // Book consultation
  bookConsultation: async (expertId: string, consultationType: string) => {
    const response = await api.post('/api/consultations', {
      expert_id: expertId,
      consultation_type: consultationType,
    })
    return response.data
  },

  // Get consultation history
  getConsultations: async () => {
    const response = await api.get('/api/consultations')
    return response.data
  },
}

// User API
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/api/user/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    const response = await api.put('/api/user/profile', profileData)
    return response.data
  },

  // Get user statistics
  getStats: async () => {
    const response = await api.get('/api/user/stats')
    return response.data
  },
}
