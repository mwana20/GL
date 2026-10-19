import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, MessageSquare, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { LandListing } from '../types';
import { formatUgx, formatLandSize, buildWhatsAppSiteVisitUrl } from '../utils/formatters';
import { api } from '../services/api';

interface SiteVisitModalProps {
  listing: LandListing;
  isOpen: boolean;
  onClose: () => void;
}

export const SiteVisitModal: React.FC<SiteVisitModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  // Today's date formatted as YYYY-MM-DD to prevent selecting past dates
  const todayStr = new Date().toISOString().split('T')[0];

  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{ whatsappUrl: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!visitorName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!preferredDate) {
      setErrorMessage('Please choose your preferred visit date.');
      return;
    }

    // Verify future date
    if (preferredDate < todayStr) {
      setErrorMessage('Preferred date cannot be in the past.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Record site visit in the database
      await api.submitSiteVisit({
        listingId: listing.id,
        listingReference: listing.referenceNumber,
        listingTitle: listing.title,
        districtName: listing.districtName,
        subcountyName: listing.administrativeUnitName,
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim() || undefined,
        preferredDate,
        preferredTime,
        additionalMessage: additionalMessage.trim() || undefined,
      });

      // 2. Build WhatsApp URL
      const whatsappUrl = buildWhatsAppSiteVisitUrl(listing, {
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim() || undefined,
        preferredDate,
        preferredTime,
        additionalMessage: additionalMessage.trim() || undefined,
      });

      setSuccessData({ whatsappUrl });
    } catch (err: any) {
      console.error('Error registering visit:', err);
      // Fallback: even if server network hiccups, user still gets WhatsApp URL!
      const whatsappUrl = buildWhatsAppSiteVisitUrl(listing, {
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim() || undefined,
        preferredDate,
        preferredTime,
        additionalMessage: additionalMessage.trim() || undefined,
      });
      setSuccessData({ whatsappUrl });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchWhatsApp = () => {
    if (successData?.whatsappUrl) {
      window.open(successData.whatsappUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!successData ? (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                GL Real Estates · Site Inspection
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">
                Plan a Site Visit
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Request an on-site physical tour of this plot with our field representative.
              </p>
            </div>

            {/* Target Property Card */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 mb-6 text-xs space-y-1">
              <div className="flex items-center justify-between text-neutral-500 font-mono">
                <span>Ref: {listing.referenceNumber}</span>
                <span className="text-emerald-900 font-bold tabular-nums font-sans">
                  {formatUgx(listing.priceUgx)}
                </span>
              </div>
              <p className="font-semibold text-neutral-900 line-clamp-1">{listing.title}</p>
              <p className="text-neutral-600">
                {listing.districtName}, {listing.administrativeUnitName} ·{' '}
                {formatLandSize(listing.landSize, listing.measurementUnit)}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Mukasa"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Phone Number / WhatsApp (Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0772 123456 or +256..."
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Preferred Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Preferred Time Slot</span>
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  >
                    <option value="9:00 AM">Morning (9:00 AM)</option>
                    <option value="11:00 AM">Midday (11:00 AM)</option>
                    <option value="2:00 PM">Afternoon (2:00 PM)</option>
                    <option value="4:00 PM">Late Afternoon (4:00 PM)</option>
                    <option value="Flexible">Any convenient time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Notes / Meeting Point Preference</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Can meet at Kira Total Station, need GPS pin."
                  value={additionalMessage}
                  onChange={(e) => setAdditionalMessage(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              {/* Explicit Confirmation Notice */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong>Important Notice:</strong> Submitting this request does not confirm the site visit automatically. A GL Real Estates agent will review the schedule and confirm the exact meeting point via WhatsApp or telephone.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Preparing...' : 'Proceed to WhatsApp Confirmation'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation & WhatsApp Redirect Step */
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-neutral-900">
                Site Visit Request Registered
              </h3>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                Your viewing request for <strong>{listing.referenceNumber}</strong> has been logged in our system. Now click below to open your prefilled WhatsApp message to notify GL Real Estates.
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-left text-neutral-700 space-y-1.5">
              <p><strong>Plot:</strong> {listing.title}</p>
              <p><strong>District:</strong> {listing.districtName} ({listing.administrativeUnitName})</p>
              <p><strong>Date & Time:</strong> {preferredDate} at {preferredTime}</p>
              <p><strong>Visitor:</strong> {visitorName} {visitorPhone ? `(${visitorPhone})` : ''}</p>
            </div>

            <div className="pt-3 flex flex-col gap-2">
              <button
                onClick={handleLaunchWhatsApp}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20ba59] rounded-xl transition-all shadow-md"
              >
                <span>Send via WhatsApp (+256752759996)</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="text-xs text-neutral-500 hover:text-neutral-800 py-1"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
