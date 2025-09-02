'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Leaf, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
interface PredictionResult {
    predicted_class: string;
    confidence: number;
    all_predictions?: { [key: string]: number };
}
export default function OutputPage() {
  const searchParams = useSearchParams();
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

    useEffect(() => {
        const encodedData = searchParams.get('data');
        if (encodedData) {
            try {
                const decodedData = decodeURIComponent(encodedData);
                const parsedData: PredictionResult = JSON.parse(decodedData);
                setPrediction(parsedData);
            } catch (e) {
                console.error("Failed to parse prediction data from URL:", e);
            }
        }
    }, [searchParams]);

    if (!prediction) {
        return <div>Loading or no data available...</div>;
    }

  // Format the disease name for display
  const formatDiseaseName = (name: string) => {
    return name.replace(/__/g, ' - ').replace(/_/g, ' ')
  }

  const remedies = [
    {
      id: 1,
      title: "Apply Preventive Sprays",
      icon: <Leaf className="h-5 w-5 text-green-600" />,
      steps: [
        "Copper-based bactericides (like copper hydroxide or copper oxychloride)",
        "Spray every 7–10 days during moist conditions",
        "Use in combination with mancozeb (optional) for better effect",
        "Overuse of copper may lead to resistance. Rotate with other options when possible"
      ],
      priority: "high"
    },
    {
      id: 2,
      title: "Remove and Destroy Infected Plants",
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      steps: [
        "Uproot and burn or bury infected plants and fruits",
        "Do not compost infected material"
      ],
      priority: "critical"
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Disease Analysis Results
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Detailed diagnosis and treatment recommendations
            </p>
          </div>
        </div>

      
        {/* Prediction Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Diagnosis Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Predicted Disease */}
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Predicted Class:
              </h3>
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg font-medium text-lg">
                {formatDiseaseName(prediction.predicted_class)}
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Confidence:</span>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                  {prediction.confidence.toFixed(2)}%
                </Badge>
              </div>
            </div>

            {/* Confidence Visualization - Simple Progress Bar */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white text-center">
                Confidence Visualization
              </h4>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-center transition-all duration-1000 ease-out"
                  style={{ width: `${prediction.confidence}%` }}
                >
                  <span className="text-white text-sm font-medium">
                    {prediction.confidence.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {prediction.confidence.toFixed(2)}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">High Accuracy</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uncertainty</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {(100 - prediction.confidence).toFixed(2)}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Low Risk</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disease Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              About This Disease
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Bacterial Spot</strong> is a common bacterial disease affecting pepper plants. 
                It causes dark, water-soaked spots on leaves, stems, and fruits. The disease thrives in 
                warm, humid conditions and can spread rapidly through water splash and contaminated tools.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Treatment Remedies */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recommended Treatment
          </h2>
          
          {remedies.map((remedy) => (
            <Card key={remedy.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {remedy.icon}
                    <span>{remedy.title}</span>
                  </div>
                  <Badge className={getPriorityColor(remedy.priority)}>
                    {remedy.priority.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {remedy.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Recommendations */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Prevention Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Ensure good air circulation around plants</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Avoid overhead watering; use drip irrigation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Sanitize tools between plants</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Choose resistant varieties when available</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Remove plant debris regularly</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button className="flex-1">
            Save to History
          </Button>
          <Button variant="outline" className="flex-1">
            Consult Expert
          </Button>
          <Button variant="outline">
            Share Results
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-6">
          <p>Analysis completed on {new Date().toLocaleDateString()}</p>
          <p>For severe infections, consult with a plant pathologist</p>
        </div>
      </div>
    </div>
  )
}
