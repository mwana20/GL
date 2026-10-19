import { LandListing } from '../types';

export const GL_WHATSAPP_NUMBER = '256752759996';
export const GL_PHONE_NUMBER = '0764785491';
export const GL_PHONE_INTERNATIONAL = '+256764785491';

/**
 * Formats a numeric price into Ugandan Shillings (UGX).
 */
export function formatUgx(amount: number): string {
  if (isNaN(amount)) return 'UGX 0';
  return `UGX ${amount.toLocaleString('en-US')}`;
}

/**
 * Formats land size and measurement unit.
 */
export function formatLandSize(size: number, unit: string): string {
  if (!size) return '';
  return `${size.toLocaleString('en-US')} ${unit}`;
}

/**
 * Builds a properly URL-encoded WhatsApp inquiry URL for a specific land listing.
 */
export function buildWhatsAppInquiryUrl(listing: LandListing): string {
  const message = `Hello GL Real Estates (Glorious Living),

I am interested in this land listing:

Property: ${listing.title}
Listing Reference: ${listing.referenceNumber}
Price: ${formatUgx(listing.priceUgx)}
District: ${listing.districtName}
Subcounty: ${listing.administrativeUnitName}
Land Size: ${formatLandSize(listing.landSize, listing.measurementUnit)}

Please provide more information about availability, location, ownership documentation, and the purchasing process.

Thank you.`;

  return `https://wa.me/${GL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a properly URL-encoded WhatsApp site-visit booking URL.
 */
export function buildWhatsAppSiteVisitUrl(
  listing: LandListing,
  visitData: {
    visitorName: string;
    visitorPhone?: string;
    preferredDate: string;
    preferredTime: string;
    additionalMessage?: string;
  }
): string {
  const contactLine = visitData.visitorPhone && visitData.visitorPhone.trim() 
    ? `\nMy Contact: ${visitData.visitorPhone.trim()}` 
    : '';

  const noteLine = visitData.additionalMessage && visitData.additionalMessage.trim()
    ? `\nNote: ${visitData.additionalMessage.trim()}`
    : '';

  const message = `Hello GL Real Estates (Glorious Living),

I would like to arrange a site visit for the following land:

Property: ${listing.title}
Listing Reference: ${listing.referenceNumber}
Asking Price: ${formatUgx(listing.priceUgx)}
District: ${listing.districtName}
Subcounty: ${listing.administrativeUnitName}
Land Size: ${formatLandSize(listing.landSize, listing.measurementUnit)}

Preferred Visit Date: ${visitData.preferredDate}
Preferred Time: ${visitData.preferredTime}

Please confirm whether the plot is available for viewing and advise me on the meeting point.

My Name: ${visitData.visitorName.trim()}${contactLine}${noteLine}

Thank you.`;

  return `https://wa.me/${GL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * General contact WhatsApp message.
 */
export function buildGeneralWhatsAppUrl(subject?: string): string {
  const intro = subject 
    ? `Hello GL Real Estates (Glorious Living),\n\nI have an inquiry regarding: ${subject}.\n\nPlease assist me with land options in Uganda.`
    : `Hello GL Real Estates (Glorious Living),\n\nI am looking for land in Uganda and would like to speak with a representative.`;

  return `https://wa.me/${GL_WHATSAPP_NUMBER}?text=${encodeURIComponent(intro)}`;
}
