// Database configuration and utilities
export interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
}


// Database table schemas
export const schemas = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  predictions: `
    CREATE TABLE IF NOT EXISTS predictions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      predicted_class VARCHAR(255) NOT NULL,
      confidence DECIMAL(5,2) NOT NULL,
      all_predictions JSONB,
      disease_info JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  experts: `
    CREATE TABLE IF NOT EXISTS experts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      specialty VARCHAR(255) NOT NULL,
      rating DECIMAL(3,2) DEFAULT 0,
      reviews INTEGER DEFAULT 0,
      location VARCHAR(255),
      availability VARCHAR(255),
      price VARCHAR(100),
      image_url TEXT,
      bio TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  consultations: `
    CREATE TABLE IF NOT EXISTS consultations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      expert_id UUID REFERENCES experts(id) ON DELETE CASCADE,
      consultation_type VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      scheduled_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  diseases: `
    CREATE TABLE IF NOT EXISTS diseases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL,
      severity VARCHAR(50) NOT NULL,
      symptoms TEXT[],
      treatment TEXT[],
      prevention TEXT[],
      description TEXT,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `
}

// Sample data for seeding
export const sampleData = {
  diseases: [
    {
      name: 'Powdery Mildew',
      category: 'Fungal',
      severity: 'Medium',
      symptoms: ['White powdery coating on leaves', 'Yellowing of leaves', 'Stunted growth'],
      treatment: ['Apply fungicide', 'Improve air circulation', 'Remove affected parts'],
      prevention: ['Avoid overhead watering', 'Ensure good spacing', 'Choose resistant varieties'],
      description: 'A common fungal disease that affects many plants',
      image_url: '/diseases/powdery-mildew.jpg'
    },
    {
      name: 'Aphid Infestation',
      category: 'Pest',
      severity: 'Low',
      symptoms: ['Small green insects on stems', 'Sticky honeydew on leaves', 'Curled leaves'],
      treatment: ['Use insecticidal soap', 'Apply neem oil', 'Introduce beneficial insects'],
      prevention: ['Regular inspection', 'Encourage beneficial insects', 'Companion planting'],
      description: 'Small soft-bodied insects that feed on plant sap',
      image_url: '/diseases/aphids.jpg'
    }
  ],
  
  experts: [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Plant Pathology',
      rating: 4.9,
      reviews: 127,
      location: 'California, USA',
      availability: 'Available now',
      price: '$25/consultation',
      image_url: '/experts/dr-sarah.jpg',
      bio: '15+ years experience in plant disease diagnosis and treatment'
    }
  ]
}
