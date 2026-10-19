import React, { useState } from 'react';
import { Camera, Video, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ListingMediaItem } from '../types';

interface MediaGalleryProps {
  media: ListingMediaItem[];
  title: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ media, title }) => {
  const photos = media.filter((m) => m.mediaType === 'photo').slice(0, 3);
  const video = media.find((m) => m.mediaType === 'video');

  // Active view: 0, 1, 2 = photos; 3 = video
  const [activeTab, setActiveTab] = useState<'photo' | 'video'>('photo');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="space-y-3">
      {/* Main Display Box */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-sm">
        {activeTab === 'photo' && currentPhoto && (
          <div className="relative w-full h-full group">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.caption || `${title} - Photo ${selectedPhotoIndex + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />

            {/* Photo caption */}
            {currentPhoto.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8 text-xs text-white">
                <span className="font-medium">{currentPhoto.caption}</span>
              </div>
            )}

            {/* Navigation arrows for photos */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/85 transition-colors focus:outline-none"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/85 transition-colors focus:outline-none"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Fullscreen Trigger */}
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-white hover:bg-black/85 transition-colors focus:outline-none flex items-center gap-1.5 text-xs font-medium"
              title="View full resolution photo"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Enlarge</span>
            </button>
          </div>
        )}

        {/* Video Player */}
        {activeTab === 'video' && video && (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <video
              src={video.url}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>

      {/* Thumbnails Row: Exactly 3 Photographs + 1 Video */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {/* 3 Photos */}
        {photos.map((item, idx) => {
          const isSelected = activeTab === 'photo' && selectedPhotoIndex === idx;
          return (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => {
                setActiveTab('photo');
                setSelectedPhotoIndex(idx);
              }}
              className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all focus:outline-none ${
                isSelected
                  ? 'border-emerald-700 ring-2 ring-emerald-700/20'
                  : 'border-transparent opacity-75 hover:opacity-100 hover:border-neutral-300'
              }`}
            >
              <img
                src={item.url}
                alt={`Thumbnail ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1 bg-black/75 px-1.5 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
                <Camera className="w-2.5 h-2.5" />
                <span>Photo {idx + 1}</span>
              </div>
            </button>
          );
        })}

        {/* 1 Video */}
        {video ? (
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all bg-neutral-900 focus:outline-none flex flex-col items-center justify-center text-white ${
              activeTab === 'video'
                ? 'border-emerald-700 ring-2 ring-emerald-700/20'
                : 'border-transparent opacity-80 hover:opacity-100 hover:border-neutral-300'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-md">
              <Video className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-wide uppercase mt-1">
              Video Tour
            </span>
          </button>
        ) : (
          <div className="aspect-[4/3] rounded-lg bg-neutral-100 border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-xs">
            No Video
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 focus:outline-none"
            aria-label="Close enlarged preview"
          >
            <X className="w-7 h-7" />
          </button>

          <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.caption || title}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>

          <div className="mt-4 text-center text-white text-xs space-y-1">
            <p className="font-semibold">{currentPhoto.caption || title}</p>
            <p className="text-neutral-400">
              Photo {selectedPhotoIndex + 1} of {photos.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
