export type UgandaRegion = 'Central' | 'Eastern' | 'Northern' | 'Western';

export type AdministrativeUnitType = 'Subcounty' | 'Town Council' | 'City Division' | 'Municipality Division';

export interface District {
  id: string;
  name: string;
  region: UgandaRegion;
  code?: string;
  isActive: boolean;
  source: string;
  lastVerifiedDate: string;
}

export interface AdministrativeUnit {
  id: string;
  districtId: string;
  name: string;
  unitType: AdministrativeUnitType;
  isActive: boolean;
  code?: string;
  source?: string;
}

export type LandUseCategory = 
  | 'Residential Plot'
  | 'Commercial Land'
  | 'Agricultural Land'
  | 'Mixed-Use Land'
  | 'Industrial Land';

export type LandMeasurementUnit = 'decimals' | 'acres' | 'sq meters';

export type LandTenureType = 
  | 'Mailo Land (Private Mailo)'
  | 'Freehold'
  | 'Leasehold'
  | 'Customary';

export type AvailabilityStatus = 'available' | 'reserved' | 'sold';
export type PublicationStatus = 'published' | 'draft' | 'unpublished';

export interface ListingMediaItem {
  id: string;
  listingId: string;
  mediaType: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  displayOrder: number;
  caption?: string;
}

export interface LandListing {
  id: string;
  referenceNumber: string; // e.g. GL-0001
  title: string;
  description: string;
  priceUgx: number;
  landSize: number;
  measurementUnit: LandMeasurementUnit;
  category: LandUseCategory;
  
  // Location hierarchy
  districtId: string;
  districtName: string;
  administrativeUnitId: string;
  administrativeUnitName: string;
  parishOrWard?: string;
  villageOrLocality?: string;
  additionalLocationInfo?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };

  // Property Details
  tenureType?: LandTenureType;
  roadAccess?: string;
  electricityAvailable?: boolean;
  waterAvailable?: boolean;
  waterSource?: string;
  topography?: string; // e.g. "Gentle slope with panoramic valley view"
  zoningDetails?: string;

  // Media (Exactly 3 photos + 1 video for published listings)
  media: ListingMediaItem[];

  // Status flags
  availability: AvailabilityStatus;
  publicationStatus: PublicationStatus;
  isFeatured: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface SiteVisitRequest {
  id: string;
  listingId: string;
  listingReference: string;
  listingTitle: string;
  districtName: string;
  subcountyName: string;
  visitorName: string;
  visitorPhone?: string;
  preferredDate: string;
  preferredTime: string;
  additionalMessage?: string;
  status: 'pending_confirmation' | 'contacted' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface InquiryRecord {
  id: string;
  listingId?: string;
  listingReference?: string;
  inquiryType: 'whatsapp_listing' | 'whatsapp_site_visit' | 'general_contact';
  visitorName?: string;
  visitorContact?: string;
  createdAt: string;
  notes?: string;
}

export type AdminRole = 'super_admin' | 'property_manager' | 'customer_support';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}

export interface SearchFilters {
  query?: string;
  districtId?: string;
  administrativeUnitId?: string;
  category?: LandUseCategory | 'all';
  minPriceUgx?: number;
  maxPriceUgx?: number;
  availability?: AvailabilityStatus | 'all';
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'size_desc';
}
