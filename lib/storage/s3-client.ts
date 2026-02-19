import { S3Client } from '@aws-sdk/client-s3';

/**
 * AWS S3 Client Singleton
 * 
 * Configured for Indian region (ap-south-1 - Mumbai)
 * This is our connection to the cloud photo archive
 */

// Validate environment variables
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Create S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Optional: Configure for better performance
  maxAttempts: 3, // Retry failed requests up to 3 times
});

// Bucket names based on environment
export const getPhotoBucket = (): string => {
  return process.env.NODE_ENV === 'production'
    ? process.env.AWS_S3_BUCKET_TRAIN_PHOTOS_PROD!
    : process.env.AWS_S3_BUCKET_TRAIN_PHOTOS!;
};