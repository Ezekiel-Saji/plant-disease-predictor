import { useState, useCallback } from 'react'
import { plantAPI, PredictionResult, HistoryItem } from '@/lib/plant-api'
import { storageService } from '@/lib/storage'

export function usePlantPrediction() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const predictDisease = useCallback(async (imageFile: File): Promise<PredictionResult | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // Upload image first
      const imageUrl = await storageService.uploadImage(imageFile, 'predictions')
      
      // Get prediction
      const prediction = await plantAPI.predictDisease(imageFile)
      
      // Save to history
      await plantAPI.saveToHistory(prediction, imageFile)
      
      return prediction
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict disease'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    predictDisease,
    isLoading,
    error,
  }
}

export function usePlantHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await plantAPI.getHistory()
      setHistory(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      await plantAPI.deleteHistoryItem(id)
      setHistory(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item'
      setError(errorMessage)
    }
  }, [])

  return {
    history,
    fetchHistory,
    deleteHistoryItem,
    isLoading,
    error,
  }
}
