// Utilidades para manejo de imágenes y fallbacks

/**
 * Crea una imagen SVG de fallback personalizada
 * @param {Object} options - Opciones para la imagen de fallback
 * @param {number} options.width - Ancho de la imagen
 * @param {number} options.height - Alto de la imagen
 * @param {string} options.text - Texto a mostrar
 * @param {string} options.bgColor - Color de fondo (hex)
 * @param {string} options.accentColor - Color de acento (hex)
 * @returns {string} - Data URL del SVG
 */
export function createFallbackImage({
  width = 300,
  height = 200,
  text = 'Imagen no disponible',
  bgColor = '#fef2f2',
  accentColor = '#dc2626'
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      <rect x="${width * 0.1}" y="${height * 0.2}" width="${width * 0.8}" height="${height * 0.6}" fill="${accentColor}" opacity="0.1" rx="10"/>
      <circle cx="${width * 0.4}" cy="${height * 0.4}" r="${width * 0.08}" fill="${accentColor}" opacity="0.3"/>
      <rect x="${width * 0.35}" y="${height * 0.45}" width="${width * 0.1}" height="${height * 0.05}" fill="${accentColor}" opacity="0.3" rx="2"/>
      <text x="${width * 0.5}" y="${height * 0.7}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.05}" fill="${accentColor}">
        ${text}
      </text>
    </svg>
  `
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * URLs de imágenes de Unsplash para diferentes categorías
 */
export const categoryImages = {
  alimentos: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop&crop=center'
  ],
  accesorios: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1587145820266-a5951ee6f2bb?w=300&h=200&fit=crop&crop=center'
  ],
  papeleria: [
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop&crop=center'
  ]
}

/**
 * Obtiene imágenes aleatorias para una categoría
 * @param {string} category - Categoría del producto
 * @param {number} count - Número de imágenes a obtener
 * @returns {string[]} - Array de URLs de imágenes
 */
export function getRandomImagesForCategory(category, count = 4) {
  const images = categoryImages[category] || categoryImages.accesorios
  const shuffled = [...images].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * URLs de avatares de usuarios
 */
export const userAvatars = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face'
]

/**
 * Obtiene un avatar aleatorio
 * @returns {string} - URL del avatar
 */
export function getRandomAvatar() {
  return userAvatars[Math.floor(Math.random() * userAvatars.length)]
}

