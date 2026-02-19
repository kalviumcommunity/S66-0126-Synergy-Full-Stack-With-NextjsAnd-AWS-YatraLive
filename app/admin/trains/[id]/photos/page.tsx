'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PhotoUploader } from '@/components/trains/PhotoUploader';
import { PhotoGallery } from '@/components/trains/PhotoGallery';
import { ArrowLeft } from 'lucide-react';

export default function AdminTrainPhotosPage() {
  const params = useParams();
  const router = useRouter();
  const [train, setTrain] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    fetchTrain();
  }, [params.id]);
  
  const fetchTrain = async () => {
    try {
      const response = await fetch(`/api/admin/trains/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setTrain(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch train:', error);
    }
  };
  
  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  if (!train) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">
          Manage Photos: {train.name} ({train.number})
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Upload New Photo</h2>
        <PhotoUploader
          trainNumber={train.number}
          onUploadComplete={handleUploadComplete}
        />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Photo Gallery</h2>
        <PhotoGallery
          key={refreshKey}
          trainId={train.id}
          trainNumber={train.number}
          isAdmin={true}
        />
      </div>
    </div>
  );
}