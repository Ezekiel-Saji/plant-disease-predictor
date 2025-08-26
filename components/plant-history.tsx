'use client'

import { useState, useEffect } from 'react'
import { Calendar, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface HistoryItem {
  id: number
  image: string
  prediction: {
    predicted_class: string
    confidence: number
  }
  timestamp: string
}

export default function PlantHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('plantHistory') || '[]')
    setHistory(savedHistory)
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('plantHistory')
    setHistory([])
  }

  const deleteItem = (id: number) => {
    const updatedHistory = history.filter(item => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem('plantHistory', JSON.stringify(updatedHistory))
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (selectedItem) {
    return (
      <div className="p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedItem(null)}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold">Prediction Details</h1>
            <div></div>
          </div>

          <Card>
            <CardContent className="p-4">
              <img
                src={selectedItem.image || "/placeholder.svg"}
                alt="Plant analysis"
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Predicted Disease:</h3>
                  <Badge className="bg-green-100 text-green-800">
                    {selectedItem.prediction.predicted_class}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Confidence:</h3>
                  <Badge className={getConfidenceColor(selectedItem.prediction.confidence)}>
                    {selectedItem.prediction.confidence.toFixed(1)}%
                  </Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Date:</h3>
                  <p className="text-gray-600">{formatDate(selectedItem.timestamp)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analysis History
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View your previous plant disease predictions
          </p>
        </div>

        {/* Actions */}
        {history.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">{history.length} analyses</p>
            <Button variant="outline" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}

        {/* History List */}
        {history.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No History Yet</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your plant disease analyses will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt="Plant analysis"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate dark:text-white">
                          {item.prediction.predicted_class}
                        </h3>
                        <Badge className={getConfidenceColor(item.prediction.confidence)}>
                          {item.prediction.confidence.toFixed(1)}%
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 dark:text-gray-300">
                        {formatDate(item.timestamp)}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedItem(item)}
                          className="h-7 px-2"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteItem(item.id)}
                          className="h-7 px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
