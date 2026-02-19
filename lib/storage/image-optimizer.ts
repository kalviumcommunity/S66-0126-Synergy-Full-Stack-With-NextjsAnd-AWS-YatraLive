import sharp from 'sharp';
import { uploadConfig } from './upload-config';

/**
 * Image optimization service
 * 
 * Resizes and compresses images for web delivery
 * Like having a photo development lab that creates different sizes
 */

export interface OptimizedImages {
  original: Buffer;
  thumbnail: Buffer;
  preview: Buffer;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export class ImageOptimizer {
  
  /**
   * Optimize an image - create multiple sizes
   */
  async optimize(imageBuffer: Buffer): Promise<OptimizedImages> {
    // Get original metadata
    const metadata = await sharp(imageBuffer).metadata();
    
    // Create thumbnail (small, cropped)
    const thumbnail = await sharp(imageBuffer)
      .resize(
        uploadConfig.imageSizes.thumbnail.width,
        uploadConfig.imageSizes.thumbnail.height,
        { fit: uploadConfig.imageSizes.thumbnail.fit }
      )
      .jpeg({ quality: 80 })
      .toBuffer();
    
    // Create preview (medium, optimized)
    const preview = await sharp(imageBuffer)
      .resize(
        uploadConfig.imageSizes.preview.width,
        uploadConfig.imageSizes.preview.height,
        { fit: uploadConfig.imageSizes.preview.fit }
      )
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
    
    return {
      original: imageBuffer,
      thumbnail,
      preview,
      metadata: {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: imageBuffer.length,
      },
    };
  }
  
  /**
   * Generate a blurhash for lazy loading
   * (Optional - creates a tiny blurred placeholder)
   */
  async generateBlurhash(imageBuffer: Buffer): Promise<string> {
    // This would require additional library
    // For now, return a simple base64 placeholder
    const tinyImage = await sharp(imageBuffer)
      .resize(10, 10)
      .jpeg({ quality: 30 })
      .toBuffer();
    
    return `data:image/jpeg;base64,${tinyImage.toString('base64')}`;
  }
}

export const imageOptimizer = new ImageOptimizer();