// File storage utilities for images
export class StorageService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:5000'
  }

  // Upload image file
  async uploadImage(file: File, folder: string = 'uploads'): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data = await response.json()
    return data.url
  }

  // Delete image
  async deleteImage(imageUrl: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/upload`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: imageUrl }),
    })
  }

  // Get image URL
  getImageUrl(path: string): string {
    if (path.startsWith('http')) {
      return path
    }
    return `${this.baseUrl}${path}`
  }
}

export const storageService = new StorageService()
