'use client'

import { useState } from 'react'
import { MessageCircle, Phone, Video, Star, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const experts = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Plant Pathology",
    rating: 4.9,
    reviews: 127,
    location: "California, USA",
    availability: "Available now",
    price: "$25/consultation",
    image: "/female-doctor.png",
    bio: "15+ years experience in plant disease diagnosis and treatment"
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    specialty: "Agricultural Science",
    rating: 4.8,
    reviews: 89,
    location: "Ontario, Canada",
    availability: "Available in 2 hours",
    price: "$30/consultation",
    image: "/male-professor.png",
    bio: "Expert in crop diseases and sustainable farming practices"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Horticulture",
    rating: 4.9,
    reviews: 156,
    location: "Florida, USA",
    availability: "Available now",
    price: "$20/consultation",
    image: "/female-botanist.png",
    bio: "Specializes in ornamental plants and garden disease management"
  }
]

export default function ExpertConnection() {
  const [selectedExpert, setSelectedExpert] = useState<number | null>(null)

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Expert Connection
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Connect with plant disease specialists for professional advice
          </p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Consultation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="h-16 flex flex-col items-center gap-1">
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">Chat</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center gap-1">
                <Phone className="h-5 w-5" />
                <span className="text-xs">Call</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center gap-1">
                <Video className="h-5 w-5" />
                <span className="text-xs">Video</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Experts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Experts</h2>
          
          {experts.map((expert) => (
            <Card key={expert.id} className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={expert.image || "/placeholder.svg"} alt={expert.name} />
                    <AvatarFallback>{expert.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{expert.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {expert.price}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{expert.specialty}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{expert.rating} ({expert.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{expert.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">{expert.availability}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 px-2">
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" className="h-7 px-3 text-xs">
                          Consult
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 pl-15">{expert.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Contact */}
        <Card className="border-red-200 bg-red-50 dark:bg-red-800 dark:border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center dark:bg-red-900">
                <Phone className="h-5 w-5 text-red-600 dark:text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-white">Emergency Plant Care</h3>
                <p className="text-sm text-red-700 dark:text-gray-300">24/7 urgent plant disease support</p>
              </div>
              <Button size="sm" variant="destructive" className="dark:bg-red-900 dark:text-white">
                Call Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
