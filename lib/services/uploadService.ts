import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, getPhotoBucket } from '@/lib/storage/s3-client';
import { prisma } from '@/lib/prisma/client';
import {
  isValidFileType,
  isValidFileSize,
  generateUniqueFilename,
  uploadConfig,
} from '@/lib/storage/upload-config';
import { imageOptimizer } from '@/lib/storage/image-optimizer';
import { auditService } from './auditService';

/**
 * Upload Service
 * 
 * Handles all file upload operations:
 * - Generating pre-signed URLs for direct upload
 * - Processing uploaded images
 * - Storing metadata in database
 * - Managing photo gallery
 * 
 * ANALOGY: The photo submission counter at the station
 */

export class UploadService {
  
  /**
   * Generate a pre-signed URL for direct upload to S3
   */
  async getPresignedUploadUrl(params: {
    trainNumber: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    adminId: string;
  }) {
    const { trainNumber, filename, mimeType, fileSize, adminId } = params;
    
    // Validate file type
    if (!isValidFileType(mimeType)) {
      throw new Error(`Invalid file type. Allowed: ${uploadConfig.allowedMimeTypes.join(', ')}`);
    }
    
    // Validate file size
    if (!isValidFileSize(fileSize)) {
      throw new Error(`File too large. Maximum: ${uploadConfig.maxFileSize / 1024 / 1024}MB`);
    }
    
    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(filename);
    const key = uploadConfig.paths.trainPhotos(trainNumber, uniqueFilename);
    
    // Create pre-signed URL (valid for 5 minutes)
    const command = new PutObjectCommand({
      Bucket: getPhotoBucket(),
      Key: key,
      ContentType: mimeType,
      Metadata: {
        uploadedBy: adminId,
        trainNumber,
        originalFilename: filename,
      },
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    
    return {
      url,
      key,
      fields: {}, // For multipart uploads
    };
  }
  
  /**
   * Process uploaded image and save to database
   */
  async processUploadedImage(params: {
    key: string;
    trainId: string;
    trainNumber: string;
    adminId: string;
    caption?: string;
    location?: string;
    dateTaken?: Date;
    isPrimary?: boolean;
  }) {
    const {
      key,
      trainId,
      trainNumber,
      adminId,
      caption,
      location,
      dateTaken,
      isPrimary = false,
    } = params;
    
    // If setting as primary, unset any existing primary
    if (isPrimary) {
      await prisma.trainPhoto.updateMany({
        where: {
          trainId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }
    
    // Create database record
    const photo = await prisma.trainPhoto.create({
      data: {
        trainId,
        trainNumber,
        key,
        url: `https://${getPhotoBucket()}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        thumbnailUrl: `https://${getPhotoBucket()}.s3.${process.env.AWS_REGION}.amazonaws.com/${key.replace('/photos/', '/thumbnails/')}`,
        filename: key.split('/').pop()!,
        filesize: 0, // Will be updated after we fetch metadata
        mimeType: 'image/jpeg', // Will be updated
        caption,
        location,
        dateTaken,
        isPrimary,
        uploadedById: adminId,
      },
    });
    
    // Audit log
    await auditService.logAdminAction({
      adminId,
      action: 'UPLOAD_PHOTO',
      entityType: 'TRAIN_PHOTO',
      entityId: photo.id,
      metadata: { trainNumber, isPrimary },
    });
    
    return photo;
  }
  
  /**
   * Delete a photo
   */
  async deletePhoto(photoId: string, adminId: string) {
    const photo = await prisma.trainPhoto.findUnique({
      where: { id: photoId },
    });
    
    if (!photo) {
      throw new Error('Photo not found');
    }
    
    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: getPhotoBucket(),
      Key: photo.key,
    });
    
    await s3Client.send(command);
    
    // Also delete thumbnail if exists
    if (photo.thumbnailUrl) {
      const thumbnailKey = photo.key.replace('/photos/', '/thumbnails/');
      const thumbCommand = new DeleteObjectCommand({
        Bucket: getPhotoBucket(),
        Key: thumbnailKey,
      });
      await s3Client.send(thumbCommand);
    }
    
    // Delete from database
    await prisma.trainPhoto.delete({
      where: { id: photoId },
    });
    
    // Audit log
    await auditService.logAdminAction({
      adminId,
      action: 'DELETE_PHOTO',
      entityType: 'TRAIN_PHOTO',
      entityId: photoId,
      metadata: { trainNumber: photo.trainNumber },
    });
  }
  
  /**
   * Get all photos for a train
   */
  async getTrainPhotos(trainId: string) {
    const photos = await prisma.trainPhoto.findMany({
      where: {
        trainId,
        isActive: true,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return photos;
  }
  
  /**
   * Set primary photo
   */
  async setPrimaryPhoto(photoId: string, trainId: string, adminId: string) {
    // Unset existing primary
    await prisma.trainPhoto.updateMany({
      where: {
        trainId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
    
    // Set new primary
    const photo = await prisma.trainPhoto.update({
      where: { id: photoId },
      data: { isPrimary: true },
    });
    
    // Audit log
    await auditService.logAdminAction({
      adminId,
      action: 'SET_PRIMARY_PHOTO',
      entityType: 'TRAIN_PHOTO',
      entityId: photoId,
      metadata: { trainNumber: photo.trainNumber },
    });
    
    return photo;
  }
  
  /**
   * Update photo metadata
   */
  async updatePhotoMetadata(
    photoId: string,
    data: {
      caption?: string;
      location?: string;
      dateTaken?: Date;
    },
    adminId: string
  ) {
    const photo = await prisma.trainPhoto.update({
      where: { id: photoId },
      data,
    });
    
    // Audit log
    await auditService.logAdminAction({
      adminId,
      action: 'UPDATE_PHOTO',
      entityType: 'TRAIN_PHOTO',
      entityId: photoId,
      metadata: { updates: data },
    });
    
    return photo;
  }
}

export const uploadService = new UploadService();