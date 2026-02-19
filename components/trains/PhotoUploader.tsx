'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, Check, AlertCircle, Loader } from 'lucide-react';

interface PhotoUploaderProps {
  trainNumber: string;
  onUploadComplete?: (photo: any) => void;
}

export function PhotoUploader({ trainNumber, onUploadComplete }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    // Reset state
    setError(null);
    setUploading(true);
    setProgress(0);
    
    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    
    try {
      // Step 1: Get pre-signed URL
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainNumber,
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });
      
      const presignData = await presignRes.json();
      
      if (!presignData.success) {
        throw new Error(presignData.error);
      }
      
      // Step 2: Upload to S3
      const { url, key } = presignData.data;
      
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', file.type);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      
      await new Promise((resolve, reject) => {
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.send(file);
      });
      
      // Step 3: Notify server
      const completeRes = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          trainNumber,
          caption,
          location,
          isPrimary,
        }),
      });
      
      const completeData = await completeRes.json();
      
      if (!completeData.success) {
        throw new Error(completeData.error);
      }
      
      onUploadComplete?.(completeData.data);
      
      // Reset form
      setTimeout(() => {
        setPreview(null);
        setCaption('');
        setLocation('');
        setIsPrimary(false);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [trainNumber, caption, location, isPrimary, onUploadComplete]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });
  
  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-500">Drop the photo here...</p>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-400">
              Drag & drop a train photo here, or click to select
            </p>
            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG, WebP up to 5MB
            </p>
          </>
        )}
      </div>
      
      {/* Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative rounded-lg overflow-hidden border dark:border-gray-700"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            
            {/* Upload progress */}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Uploading {progress}%</p>
                </div>
              </div>
            )}
            
            {/* Success overlay */}
            {!uploading && !error && progress === 100 && (
              <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Check className="w-8 h-8 mx-auto mb-2" />
                  <p>Upload complete!</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Metadata form */}
      {preview && !uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g., New Delhi station)"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Set as primary photo
            </span>
          </label>
        </motion.div>
      )}
    </div>
  );
}