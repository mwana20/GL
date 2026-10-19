import React from 'react';
import { MapPin, MessageCircle, ArrowRight, Video, Camera } from 'lucide-react';
import { LandListing } from '../types';
import { formatUgx, formatLandSize, buildWhatsAppInquiryUrl } from '../utils/formatters';

interface ListingCardProps {
  listing: LandListing;
  onSelect: (listing: LandListing) => void;
  onInquireWhatsApp?: (listing: LandListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  onInquireWhatsApp,
}) => {
  // Find primary photo (display order 1 or first photo)
  const photos = listing.media.filter((m) => m.mediaType === 'photo');
  const mainPhoto = photos[0]?.url || '/src/assets/images/uganda_plot_residential_1792429858634.jpg';
  const hasVideo = listing.media.some((m) => m.mediaType === 'video');

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInquireWhatsApp) {
      onInquireWhatsApp(listing);
    }
  };

  const isAvailable = listing.availability === 'available';
  const isReserved = listing.availability === 'reserved';
  const isSold = listing.availability === 'sold';

  return (
    <article
      onClick={() => onSelect(listing)}
      className="group bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Media Preview Box */}
      <div className="relative aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
        <img
          src={mainPhoto}
          alt={listing.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // Styled fallback if specific asset fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Media indicators (3 Photos · 1 Video) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-medium text-white">
          <div className="flex items-center gap-1">
            <Camera className="w-3 h-3 text-neutral-300" />
            <span>3 Photos</span>
          </div>
          {hasVideo && (
            <>
              <span className="text-neutral-500" aria-hidden="true">·</span>
              <div className="flex items-center gap-1 text-emerald-300">
                <Video className="w-3 h-3" />
                <span>Video Tour</span>
              </div>
            </>
          )}
        </div>

        {/* Status Indicator */}
        <div className="absolute top-3 left-3">
          {isAvailable && (
            <span className="bg-emerald-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-sm">
              Available
            </span>
          )}
          {isReserved && (
            <span className="bg-amber-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-sm">
              Reserved
            </span>
          )}
          {isSold && (
            <span className="bg-neutral-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-sm">
              Sold
            </span>
          )}
        </div>

        {/* Reference Tag */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono font-semibold text-neutral-800 shadow-sm tabular-nums">
          {listing.referenceNumber}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Metadata unboxed text (anti-slop zero pill rule) */}
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-medium text-neutral-700">{listing.category}</span>
            <span aria-hidden="true">·</span>
            <span>{formatLandSize(listing.landSize, listing.measurementUnit)}</span>
            {listing.tenureType && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[120px]">{listing.tenureType}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-neutral-900 group-hover:text-emerald-900 transition-colors line-clamp-2 leading-snug">
            {listing.title}
          </h3>

          {/* Location Details */}
          <div className="flex items-start gap-1.5 text-xs text-neutral-600">
            <MapPin className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              {listing.districtName}, {listing.administrativeUnitName}
              {listing.parishOrWard ? ` · ${listing.parishOrWard}` : ''}
              {listing.villageOrLocality ? ` (${listing.villageOrLocality})` : ''}
            </span>
          </div>
        </div>

        {/* Bottom Price & Actions */}
        <div className="pt-4 mt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 block font-medium">
              Asking Price
            </span>
            <span className="text-base sm:text-lg font-bold text-neutral-900 tabular-nums">
              {formatUgx(listing.priceUgx)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={buildWhatsAppInquiryUrl(listing)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="p-2 text-emerald-800 hover:text-white hover:bg-emerald-800 border border-emerald-800 rounded-lg transition-colors"
              title="Inquire directly on WhatsApp for this plot"
              aria-label={`Inquire on WhatsApp about ${listing.referenceNumber}`}
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <button
              onClick={() => onSelect(listing)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
