'use client'

import { useState, useRef } from 'react'
import axios from 'axios'
import { Camera, Upload, Loader2, AlertCircle, Home, Users, History, BookOpen, User, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import PlantDetector from '@/components/plant-detector'
import ExpertConnection from '@/components/expert-connection'
import PlantHistory from '@/components/plant-history'
import PlantGuide from '@/components/plant-guide'
import Profile from '@/components/profile'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

interface PredictionResult {
  predicted_class: string;
  confidence: number;
  all_predictions?: { [key: string]: number };
}


const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

const tabs = [
  { id: 'home' as TabType, label: 'Home', icon: Home },
  { id: 'expert' as TabType, label: 'Expert', icon: Users },
  { id: 'history' as TabType, label: 'History', icon: History },
  { id: 'guide' as TabType, label: 'Guide', icon: BookOpen },
  { id: 'profile' as TabType, label: 'Profile', icon: User },
]

type TabType = 'home' | 'expert' | 'history' | 'guide' | 'profile'

export default function PlantDiseaseApp() {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

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
    setError('Please select an image first');
    return;
  }

  setIsLoading(true);
  setError(null);
  setPrediction(null); // Clear previous prediction

  try {
    const formData = new FormData();
    formData.append('image', selectedImage);

    const response = await axios.post(
      'http://127.0.0.1:5000/predict', // Your Flask backend URL
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data && response.data.predicted_class) {
      setPrediction(response.data);
    } else {
      // If the backend returned an error, it will be in response.data.error
      setError(response.data.error || 'An unknown error occurred.');
    }

  } catch (err) {
    console.error('Prediction error:', err);
    // Handle network errors or if the backend is down
    const errorMessage =  'Failed to get prediction. Is the server running?';
    setError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};


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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="max-w-md mx-auto space-y-6">
            {/* Header */}
            <div className="text-center py-6">
              <h1 className="text-3xl font-bold mb-2 text-white font-serif">
                Plant Disease Detector
              </h1>
              <p className="text-slate-300">
                Upload or capture a plant image to detect diseases
              </p>
            </div>

            {/* Upload Section */}
            <Card>
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
{/*
            temporary session
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
                  onClick={() => router.push('/output')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View Sample Results Page
                </Button>
              </CardContent>
            </Card>
          */}
            {/* Image Preview */}
            {imagePreview && (
              <Card>
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
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Predicted Disease */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Predicted Disease:
                    </h3>
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                      {prediction.predicted_class}
                    </div>
                  </div>

                  {/* Confidence Chart */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4 text-center">
                      Confidence: {prediction.confidence.toFixed(1)}%
                    </h4>
                    
                    <div className="h-64 w-full">
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
                            label={({ name, value }) => `${name}: ${typeof value === 'number' ? value.toFixed(1) : '0.0'}%`}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
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
                    onClick={() => router.push('/output')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    View Detailed Results
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )
      case 'expert':
        return <ExpertConnection />
      case 'history':
        return <PlantHistory />
      case 'guide':
        return <PlantGuide />
      case 'profile':
        return <Profile />
      default:
        return <PlantDetector />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Main Content */}
      <div className="min-h-screen">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2 shadow-lg">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  isActive 
                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
