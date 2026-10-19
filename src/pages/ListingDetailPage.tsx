import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Share2, 
  ShieldCheck, 
  Check, 
  ArrowLeft, 
  FileText, 
  Zap, 
  Droplets, 
  Compass, 
  ExternalLink,
  Layers,
  Building
} from 'lucide-react';
import { LandListing } from '../types';
import { MediaGallery } from '../components/MediaGallery';
import { SiteVisitModal } from '../components/SiteVisitModal';
import { 
  formatUgx, 
  formatLandSize, 
  buildWhatsAppInquiryUrl, 
  GL_PHONE_NUMBER, 
  GL_PHONE_INTERNATIONAL 
} from '../utils/formatters';

interface ListingDetailPageProps {
  listing: LandListing;
  onBack: () => void;
  onNavigate: (tab: string, extra?: any) => void;
}

export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({
  listing,
  onBack,
  onNavigate,
}) => {
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const isAvailable = listing.availability === 'available';
  const isReserved = listing.availability === 'reserved';
  const isSold = listing.availability === 'sold';

  // Primary photo for hero backdrop
  const primaryPhoto = listing.media.find((m) => m.mediaType === 'photo')?.url || '/images/hero_uganda_landscape_1792429858568.jpg';

  return (
    <div className="space-y-8 pb-16">
      {/* 1. DEDICATED HERO SECTION FOR LISTING DETAIL */}
      <section className="relative min-h-[260px] sm:min-h-[320px] flex items-center bg-neutral-950 text-white overflow-hidden px-4 sm:px-6 lg:px-8 py-12">
        <div className="absolute inset-0 z-0">
          <img
            src={primaryPhoto}
            alt={listing.title}
            className="w-full h-full object-cover object-center brightness-100 contrast-105 scale-105"
          />
          {/* Reduced darkness overlay for bright, visible plot hero photo */}
          <div className="absolute inset-0 bg-neutral-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/25 to-neutral-950/35" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col justify-between gap-6">
          {/* Breadcrumb & Actions */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Land Catalog</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-white/10 backdrop-blur-md border border-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Copy direct shareable listing link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Plot</span>
                </>
              )}
            </button>
          </div>

          {/* Hero Property Identifiers */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded text-[11px] tabular-nums">
                {listing.referenceNumber}
              </span>
              <span aria-hidden="true" className="text-neutral-500">·</span>
              <span className="font-semibold text-neutral-200">{listing.category}</span>
              <span aria-hidden="true" className="text-neutral-500">·</span>
              <span className="text-neutral-300">
                {listing.districtName} District ({listing.administrativeUnitName})
              </span>

              {isAvailable && (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  Available for Purchase
                </span>
              )}
              {isReserved && (
                <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  Reserved / Pending
                </span>
              )}
              {isSold && (
                <span className="text-[11px] font-semibold text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-600">
                  Sold
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white max-w-4xl leading-tight">
              {listing.title}
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-300">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {listing.districtName} · {listing.administrativeUnitName}
                {listing.parishOrWard ? ` · ${listing.parishOrWard}` : ''}
                {listing.villageOrLocality ? ` (${listing.villageOrLocality})` : ''}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN DETAIL GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (8 cols): Media Gallery + Specifications */}
          <div className="lg:col-span-8 space-y-8">
            {/* Dedicated Media Gallery (3 Photos + 1 Video) */}
            <div>
              <MediaGallery media={listing.media} title={listing.title} />
            </div>

            {/* Quick Specifications Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm text-xs">
              <div>
                <span className="text-neutral-500 uppercase tracking-wider text-[10px] block font-medium">
                  Asking Price
                </span>
                <span className="text-base sm:text-lg font-bold text-neutral-900 tabular-nums">
                  {formatUgx(listing.priceUgx)}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 uppercase tracking-wider text-[10px] block font-medium">
                  Land Size
                </span>
                <span className="text-base sm:text-lg font-bold text-neutral-900">
                  {formatLandSize(listing.landSize, listing.measurementUnit)}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 uppercase tracking-wider text-[10px] block font-medium">
                  Tenure / Title
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-900 truncate block mt-0.5">
                  {listing.tenureType || 'Under Verification'}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 uppercase tracking-wider text-[10px] block font-medium">
                  Category
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-900 truncate block mt-0.5">
                  {listing.category}
                </span>
              </div>
            </div>

            {/* Property Description */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-800" />
                <span>Plot Overview & Features</span>
              </h2>
              <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-3 whitespace-pre-line">
                {listing.description}
              </div>
            </div>

            {/* Location & Infrastructure Details */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-800" />
                <span>Location, Access & Infrastructure</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="font-semibold text-neutral-800 block">District & Local Governance</span>
                  <p className="text-neutral-600">
                    {listing.districtName} District, {listing.administrativeUnitName}
                  </p>
                  {listing.parishOrWard && (
                    <p className="text-neutral-500 text-xs">
                      Parish / Ward: {listing.parishOrWard}
                    </p>
                  )}
                  {listing.villageOrLocality && (
                    <p className="text-neutral-500 text-xs">
                      Village / Locality: {listing.villageOrLocality}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-neutral-800 block">Road Access</span>
                  <p className="text-neutral-600">
                    {listing.roadAccess || 'Motorable access road connecting to main arterial route'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Electricity Grid Access</span>
                  </span>
                  <p className="text-neutral-600">
                    {listing.electricityAvailable ? 'National grid electricity available along boundary' : 'Solar potential / Grid extension planned'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    <span>Water Supply</span>
                  </span>
                  <p className="text-neutral-600">
                    {listing.waterSource || (listing.waterAvailable ? 'Piped water connection in area' : 'Borehole / rainwater catchment required')}
                  </p>
                </div>

                {listing.topography && (
                  <div className="space-y-1 sm:col-span-2">
                    <span className="font-semibold text-neutral-800 block">Topography & Soil</span>
                    <p className="text-neutral-600">{listing.topography}</p>
                  </div>
                )}

                {listing.additionalLocationInfo && (
                  <div className="space-y-1 sm:col-span-2">
                    <span className="font-semibold text-neutral-800 block">Directions & Landmarks</span>
                    <p className="text-neutral-600">{listing.additionalLocationInfo}</p>
                  </div>
                )}
              </div>

              {/* GPS Coordinates Preview */}
              {listing.gpsCoordinates && (
                <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50 p-4 rounded-xl">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                      Verified Coordinates (WGS84)
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-semibold text-neutral-900">
                      {listing.gpsCoordinates.latitude.toFixed(5)}° N, {listing.gpsCoordinates.longitude.toFixed(5)}° E
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${listing.gpsCoordinates.latitude},${listing.gpsCoordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Legal Due Diligence Reminder */}
            <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-6 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-950 text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-800" />
                <span>Independent Land Due Diligence Advised</span>
              </div>
              <p className="leading-relaxed text-amber-900">
                GL Real Estates provides transparent listing documentation for customer evaluation. Before finalizing payment, buyers are guided to verify records directly at the Ministry of Lands Zonal Office, inspect physical beacons on-site with a registered surveyor, and secure consent from local council leadership (LC1).
              </p>
            </div>
          </div>

          {/* Right Column (4 cols): Sticky Action Panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-md space-y-6">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 block font-semibold">
                  Asking Price
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1 tabular-nums">
                  {formatUgx(listing.priceUgx)}
                </div>
                <span className="text-xs text-neutral-500 mt-0.5 block">
                  Listing Reference: <span className="font-mono font-medium">{listing.referenceNumber}</span>
                </span>
              </div>

              {/* Main Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={buildWhatsAppInquiryUrl(listing)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20ba59] rounded-xl transition-all shadow-md group"
                >
                  <MessageCircle className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  <span>Inquire on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSiteVisitOpen(true)}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-950 rounded-xl transition-all shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Plan a Site Visit</span>
                </button>

                <a
                  href={`tel:${GL_PHONE_INTERNATIONAL}`}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-800" />
                  <span>Call GL: 0764785491</span>
                </a>
              </div>

              {/* Trust Assurances */}
              <div className="pt-4 border-t border-neutral-100 space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Surveyed boundary beacons verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Physical site inspection guided by agent</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Official documentation available for search</span>
                </div>
              </div>
            </div>

            {/* Company Contact Card */}
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5 text-xs space-y-2">
              <span className="font-bold text-neutral-900 block">GL Real Estates</span>
              <p className="text-neutral-600">
                Glorious Living · Land Sales & Advisory
              </p>
              <p className="text-neutral-600">
                WhatsApp: <span className="font-medium">+256752759996</span>
              </p>
              <p className="text-neutral-600">
                Phone: <span className="font-medium">0764785491</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Site Visit Modal */}
      <SiteVisitModal
        listing={listing}
        isOpen={siteVisitOpen}
        onClose={() => setSiteVisitOpen(false)}
      />
    </div>
  );
};
