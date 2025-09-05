'use client';
import axios from 'axios'
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Leaf, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation';

interface PredictionResult {
    predicted_class: string;
    confidence: number;
    all_predictions?: { [key: string]: number };
}

interface AboutDisease {
    description: string;
    causes: string[];
    symptoms: string[];
    treatment: string[];
}

export default function OutputPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [diseaseInfo, setDiseaseInfo] = useState<AboutDisease | null>(null);
    const [isInfoLoading, setIsInfoLoading] = useState(false);
    const [infoError, setInfoError] = useState<string | null>(null);

    // useEffect to parse prediction data from URL
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

    // Function to fetch disease information
    const fetchDiseaseInfo = async (diseaseName: string) => {
        setIsInfoLoading(true);
        setInfoError(null);

        try {
            const response = await axios.post(
                'http://127.0.0.1:5000/get-disease-info',
                { disease_name: diseaseName }
            );

            if (response.data.description) {
                setDiseaseInfo(response.data);
            } else {
                setInfoError('Could not find detailed information for this disease.');
            }
        } catch (err) {
            console.error('Error fetching disease info:', err);
            setInfoError('Failed to get disease details. Is the backend running?');
        } finally {
            setIsInfoLoading(false);
        }
    };

    // useEffect to trigger the fetch after prediction data is loaded
    useEffect(() => {
        if (prediction && prediction.predicted_class) {
            fetchDiseaseInfo(prediction.predicted_class);
        }
    }, [prediction]);

    if (!prediction) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading or no data available...</p>
                <Button onClick={() => router.push('/')} className="mt-4">Go Back Home</Button>
            </div>
        );
    }

    const formatDiseaseName = (name: string) => {
        return name.replace(/__/g, ' - ').replace(/_/g, ' ');
    };

    // Helper function to render a list of items
    const renderList = (title: string, items: string[]) => (
        <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );

    const isHealthy = prediction.predicted_class.toLowerCase().includes('healthy');
    const alertVariant = isHealthy ? 'default' : 'destructive';
    const alertIcon = isHealthy ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-20 p-4">
            <div className="max-w-md mx-auto space-y-6">
                <Button onClick={() => router.push('/')} variant="ghost" className="text-gray-600 dark:text-gray-400">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>

                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white font-serif">
                    Prediction Details
                </h1>

                {/* Main Prediction Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                            Diagnosis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert variant={alertVariant}>
                            {alertIcon}
                            <AlertDescription>
                                {isHealthy ? 'The plant appears healthy.' : `Potential diagnosis: ${formatDiseaseName(prediction.predicted_class)}.`}
                            </AlertDescription>
                        </Alert>

                        <div className="text-center space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Predicted Class:</h3>
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

                        {prediction.all_predictions && (
                            <div>
                                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Top 5 Predictions:</h4>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    {Object.entries(prediction.all_predictions)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([disease, confidence]) => (
                                            <li key={disease} className="flex justify-between items-center">
                                                <span>{formatDiseaseName(disease)}</span>
                                                <Badge variant="secondary">{confidence.toFixed(2)}%</Badge>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detailed Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-600"/>
                            About the Disease
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isInfoLoading ? (
                            <div className="flex items-center justify-center text-gray-500">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Loading details...
                            </div>
                        ) : infoError ? (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{infoError}</AlertDescription>
                            </Alert>
                        ) : diseaseInfo ? (
                            <div className="space-y-4">



                                <div>
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Description</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{diseaseInfo.description}</p>
                                </div>
                
                                      <div className="flex flex-col gap-3 p-4">
                                      <Card className="border-l-4 border-l-green-500 shadow-xl transform transition-transform duration-300 hover:scale-[1.02]">
                                        <CardContent className="p-6 text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                                          <div className="flex items-center mb-4">
                                            <span className="text-xl font-semibold text-green-500">
                                              {renderList('Causes', diseaseInfo.causes)}
                                            </span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                      <Card className="border-l-4 border-l-green-500 shadow-xl transform transition-transform duration-300 hover:scale-[1.02]">
                                        <CardContent className="p-6 text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                                          <div className="flex items-center mb-4">
                                            <span className="text-xl font-semibold text-yellow-500">
                                              {renderList('Symptoms', diseaseInfo.symptoms)}
                                            </span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                      <Card className="border-l-4 border-l-green-500 shadow-xl transform transition-transform duration-300 hover:scale-[1.02]">
                                        <CardContent className="p-6 text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                                          <div className="flex items-center mb-4">
                                            <span className="text-xl font-semibold text-blue-500">
                                              {renderList('Treatment', diseaseInfo.treatment)}
                                            </span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                            </div>
                        ) : (
                            <div className="text-sm text-center text-gray-500">
                                No detailed information available.
                            </div>
                        )}
                        
                              
                    </CardContent>
                </Card>
                

            </div>
        </div>
    );
}