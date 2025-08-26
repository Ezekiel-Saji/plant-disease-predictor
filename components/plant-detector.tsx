'use client'

import { useState, useRef } from 'react'
import axios from 'axios'
import { Camera, Upload, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'

interface PredictionResult {
  predicted_class: string
  confidence: number
  all_predictions?: { [key: string]: number }
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

export default function PlantDetector() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setError(null)
      setPrediction(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError('Please select an image first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)

      const response = await axios.post<PredictionResult>(
        'http://localhost:5000/predict',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      setPrediction(response.data)
      
      // Save to history (localStorage)
      const historyItem = {
        id: Date.now(),
        image: imagePreview,
        prediction: response.data,
        timestamp: new Date().toISOString(),
      }
      
      const existingHistory = JSON.parse(localStorage.getItem('plantHistory') || '[]')
      localStorage.setItem('plantHistory', JSON.stringify([historyItem, ...existingHistory]))
      
    } catch (err) {
      console.error('Prediction error:', err)
      setError('Failed to get prediction. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetApp = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setPrediction(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Prepare chart data
  const chartData = prediction ? [
    {
      name: 'Predicted',
      value: prediction.confidence,
      fill: COLORS[0]
    },
    {
      name: 'Other',
      value: 100 - prediction.confidence,
      fill: COLORS[1]
    }
  ] : []

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Plant Disease Detector
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Upload or capture a plant image to detect diseases
          </p>
        </div>

        {/* Test Section - Temporary */}
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <AlertCircle className="h-5 w-5" />
              Test Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
              Access the detailed results page directly for testing purposes
            </p>
            <Button
              onClick={() => window.open('/output', '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Sample Results Page
            </Button>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="dark:bg-zinc-950 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
              id="image-input"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-12 flex flex-col items-center gap-1"
              >
                <Camera className="h-5 w-5" />
                <span className="text-xs">Camera</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture')
                    fileInputRef.current.click()
                  }
                }}
                className="h-12 flex flex-col items-center gap-1"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">Gallery</span>
              </Button>
            </div>

            {selectedImage && (
              <div className="text-sm text-gray-600 text-center">
                Selected: {selectedImage.name}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Preview */}
        {imagePreview && (
          <Card className="dark:bg-zinc-950 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Selected plant"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Predict Disease'
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={resetApp}
                  disabled={isLoading}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {prediction && (
          <Card className="dark:bg-zinc-950 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Prediction Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Predicted Disease */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Predicted Disease:
                </h3>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg font-medium">
                  {prediction.predicted_class}
                </div>
              </div>

              {/* Confidence Chart */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 text-center">
                  Confidence: {prediction.confidence.toFixed(1)}%
                </h4>
                
                <ChartContainer
                  config={{
                    predicted: {
                      label: "Predicted",
                      color: COLORS[0],
                    },
                    other: {
                      label: "Other",
                      color: COLORS[1],
                    },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Additional Predictions */}
              {prediction.all_predictions && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    All Predictions:
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(prediction.all_predictions)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([disease, confidence], index) => (
                        <div key={disease} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{disease}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {confidence.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={resetApp}
                className="w-full"
              >
                Analyze Another Image
              </Button>

              {/* Add this temporary button */}
              <Button
                onClick={() => window.open('/output', '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-3"
              >
                View Detailed Results (Temp)
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
