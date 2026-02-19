/**
 * Upload configuration and validation
 */

export const uploadConfig = {
  allowedMimeTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp')
    .split(','),
  
  maxFileSize: parseInt(process.env.MAX_IMAGE_SIZE || '5242880'), // 5MB default
  
  // Image optimization settings
  imageSizes: {
    thumbnail: {
      width: 300,
      height: 200,
      fit: 'cover' as const,
    },
    preview: {
      width: 800,
      height: 600,
      fit: 'inside' as const,
    },
  },
  
  // S3 folder structure
  paths: {
    trainPhotos: (trainNumber: string, filename: string) => 
      `trains/${trainNumber}/photos/${Date.now()}-${filename}`,
    
    trainThumbnails: (trainNumber: string, filename: string) =>
      `trains/${trainNumber}/thumbnails/${Date.now()}-${filename}`,
  },
} as const;

/**
 * Validate file type
 */
export function isValidFileType(mimeType: string): boolean {
  return uploadConfig.allowedMimeTypes.includes(mimeType);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number): boolean {
  return size <= uploadConfig.maxFileSize;
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  
  return `${timestamp}-${random}.${extension}`;
}