'use client'

import { useState } from 'react'
import { Search, Leaf, Bug, Droplets, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const diseases = [
  {
    id: 1,
    name: "Powdery Mildew",
    category: "Fungal",
    severity: "Medium",
    symptoms: "White powdery coating on leaves",
    treatment: "Apply fungicide, improve air circulation",
    prevention: "Avoid overhead watering, ensure good spacing",
    image: "/powdery-mildew-plant.png"
  },
  {
    id: 2,
    name: "Aphid Infestation",
    category: "Pest",
    severity: "Low",
    symptoms: "Small green insects on stems and leaves",
    treatment: "Use insecticidal soap or neem oil",
    prevention: "Encourage beneficial insects, regular inspection",
    image: "/aphids-on-plant.png"
  },
  {
    id: 3,
    name: "Root Rot",
    category: "Fungal",
    severity: "High",
    symptoms: "Yellowing leaves, wilting, black roots",
    treatment: "Remove affected roots, improve drainage",
    prevention: "Proper watering, well-draining soil",
    image: "/plant-root-rot.png"
  },
  {
    id: 4,
    name: "Leaf Spot",
    category: "Bacterial",
    severity: "Medium",
    symptoms: "Brown or black spots on leaves",
    treatment: "Remove affected leaves, apply copper fungicide",
    prevention: "Avoid wet foliage, good air circulation",
    image: "/leaf-spot-disease.png"
  }
]

const careGuides = [
  {
    id: 1,
    title: "Watering Best Practices",
    icon: Droplets,
    description: "Learn proper watering techniques for healthy plants",
    tips: ["Water early morning", "Check soil moisture", "Deep, infrequent watering"]
  },
  {
    id: 2,
    title: "Light Requirements",
    icon: Sun,
    description: "Understanding light needs for different plants",
    tips: ["Full sun: 6+ hours", "Partial shade: 3-6 hours", "Full shade: <3 hours"]
  },
  {
    id: 3,
    title: "Pest Prevention",
    icon: Bug,
    description: "Keep your plants pest-free naturally",
    tips: ["Regular inspection", "Beneficial insects", "Companion planting"]
  }
]

export default function PlantGuide() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDisease, setSelectedDisease] = useState<number | null>(null)

  const categories = ['all', 'Fungal', 'Bacterial', 'Pest']

  const filteredDiseases = diseases.filter(disease => {
    const matchesSearch = disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disease.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || disease.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (selectedDisease) {
    const disease = diseases.find(d => d.id === selectedDisease)
    if (!disease) return null

    return (
      <div className="p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedDisease(null)}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold">Disease Details</h1>
            <div></div>
          </div>

          <Card>
            <CardContent className="p-4">
              <img
                src={disease.image || "/placeholder.svg"}
                alt={disease.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{disease.name}</h2>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{disease.category}</Badge>
                    <Badge className={getSeverityColor(disease.severity)}>
                      {disease.severity} Severity
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Symptoms:</h3>
                  <p className="text-gray-700">{disease.symptoms}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Treatment:</h3>
                  <p className="text-gray-700">{disease.treatment}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Prevention:</h3>
                  <p className="text-gray-700">{disease.prevention}</p>
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
            Plant Care Guide
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Learn about plant diseases and care tips
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search diseases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category === 'all' ? 'All' : category}
            </Button>
          ))}
        </div>

        {/* Care Guides */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Care Tips</h2>
          <div className="grid gap-3">
            {careGuides.map((guide) => {
              const Icon = guide.icon
              return (
                <Card key={guide.id} className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{guide.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{guide.description}</p>
                        <div className="space-y-1">
                          {guide.tips.map((tip, index) => (
                            <div key={index} className="text-xs text-gray-500">
                              • {tip}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Disease Database */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Disease Database</h2>
          <div className="space-y-3">
            {filteredDiseases.map((disease) => (
              <Card key={disease.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4" onClick={() => setSelectedDisease(disease.id)}>
                  <div className="flex items-center gap-3">
                    <img
                      src={disease.image || "/placeholder.svg"}
                      alt={disease.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{disease.name}</h3>
                        <Badge className={getSeverityColor(disease.severity)}>
                          {disease.severity}
                        </Badge>
                      </div>
                      
                      <Badge variant="secondary" className="mb-2">
                        {disease.category}
                      </Badge>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {disease.symptoms}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
