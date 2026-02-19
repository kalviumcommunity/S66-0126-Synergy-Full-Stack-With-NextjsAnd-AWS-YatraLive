'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, ChevronLeft, ChevronRight, Star, Trash2 } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  location: string | null;
  dateTaken: string | null;
  isPrimary: boolean;
  uploadedBy: {
    name: string;
  };
}

interface PhotoGalleryProps {
  trainId: string;
  trainNumber: string;
  isAdmin?: boolean;
}

export function PhotoGallery({ trainId, trainNumber, isAdmin = false }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  useEffect(() => {
    fetchPhotos();
  }, [trainId]);
  
  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/trains/${trainId}/photos`);
      const data = await response.json();
      
      if (data.success) {
        setPhotos(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      const response = await fetch(`/api/upload/photos/${photoId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPhotos(photos.filter(p => p.id !== photoId));
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };
  
  const handleSetPrimary = async (photoId: string) => {
    try {
      const response = await fetch(`/api/upload/photos/${photoId}/primary`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPhotos(photos.map(p => ({
          ...p,
          isPrimary: p.id === photoId,
        })));
      }
    } catch (error) {
      console.error('Failed to set primary:', error);
    }
  };
  
  const handleNext = () => {
    const newIndex = (selectedIndex + 1) % photos.length;
    setSelectedIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };
  
  const handlePrev = () => {
    const newIndex = (selectedIndex - 1 + photos.length) % photos.length;
    setSelectedIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };
  
  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }
  
  if (photos.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-gray-500">
        <Image className="w-12 h-12 mb-2 opacity-50" />
        <p>No photos yet</p>
        {isAdmin && (
          <p className="text-sm">Use the uploader above to add photos</p>
        )}
      </div>
    );
  }
  
  return (
    <>
      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group cursor-pointer"
            onClick={() => {
              setSelectedPhoto(photo);
              setSelectedIndex(index);
            }}
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.caption || `Train ${trainNumber}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            {/* Primary badge */}
            {photo.isPrimary && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1 rounded-full">
                <Star className="w-3 h-3 fill-current" />
              </div>
            )}
            
            {/* Admin actions */}
            {isAdmin && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!photo.isPrimary && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetPrimary(photo.id);
                    }}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                    title="Set as primary"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id);
                  }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            <div
              className="max-w-5xl max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || `Train ${trainNumber}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Photo info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                {selectedPhoto.caption && (
                  <p className="text-lg font-medium">{selectedPhoto.caption}</p>
                )}
                {selectedPhoto.location && (
                  <p className="text-sm opacity-90">{selectedPhoto.location}</p>
                )}
                <p className="text-xs opacity-75 mt-1">
                  Uploaded by {selectedPhoto.uploadedBy.name}
                  {selectedPhoto.dateTaken && ` • Taken ${new Date(selectedPhoto.dateTaken).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}