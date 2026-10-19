import { 
  District, 
  AdministrativeUnit, 
  LandListing, 
  SiteVisitRequest, 
  InquiryRecord, 
  AuditLog, 
  SearchFilters,
  AdminUser,
  AdminRole
} from '../types';
import { INITIAL_LISTINGS } from '../data/seedListings';
import { INITIAL_ADMIN_UNITS, INITIAL_DISTRICTS } from '../data/ugandaGeography';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function isApiUnavailable(error: unknown): boolean {
  return error instanceof TypeError ||
    error instanceof SyntaxError ||
    (error instanceof ApiError && error.status === 404);
}

export function getAdminToken(): string | null {
  return localStorage.getItem('gl_admin_token');
}

export function setAdminToken(token: string) {
  localStorage.setItem('gl_admin_token', token);
}

export function clearAdminToken() {
  localStorage.removeItem('gl_admin_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 401 && (errorData.code === 'SESSION_EXPIRED' || errorData.code === 'UNAUTHORIZED')) {
      clearAdminToken();
      window.dispatchEvent(new CustomEvent('gl_session_expired'));
    }
    throw new ApiError(errorData.error || `HTTP error! status: ${res.status}`, res.status);
  }

  return res.json();
}

export const api = {
  // ==========================================
  // Public
  // ==========================================
  async getDistricts(region?: string): Promise<District[]> {
    const query = region ? `?region=${encodeURIComponent(region)}` : '';
    try {
      const res = await request<{ districts: District[] }>(`/districts${query}`);
      return res.districts;
    } catch (error) {
      if (!isApiUnavailable(error)) throw error;
      console.error('Districts API is unavailable; showing bundled district data.', error);
      return INITIAL_DISTRICTS.filter((district) =>
        district.isActive && (!region || district.region === region)
      );
    }
  },

  async getSubcounties(districtId?: string): Promise<AdministrativeUnit[]> {
    const query = districtId ? `?districtId=${encodeURIComponent(districtId)}` : '';
    try {
      const res = await request<{ units: AdministrativeUnit[] }>(`/subcounties${query}`);
      return res.units;
    } catch (error) {
      if (!isApiUnavailable(error)) throw error;
      console.error('Subcounties API is unavailable; showing bundled administrative-unit data.', error);
      return INITIAL_ADMIN_UNITS.filter((unit) =>
        unit.isActive && (!districtId || unit.districtId === districtId)
      );
    }
  },

  async getListings(filters: SearchFilters = {}): Promise<{
    total: number;
    listings: LandListing[];
    isDemoFallback?: boolean;
  }> {
    const params = new URLSearchParams();
    if (filters.districtId) params.append('districtId', filters.districtId);
    if (filters.administrativeUnitId) params.append('administrativeUnitId', filters.administrativeUnitId);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.availability && filters.availability !== 'all') params.append('availability', filters.availability);
    if (filters.minPriceUgx !== undefined) params.append('minPriceUgx', String(filters.minPriceUgx));
    if (filters.maxPriceUgx !== undefined) params.append('maxPriceUgx', String(filters.maxPriceUgx));
    if (filters.query) params.append('query', filters.query);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const qs = params.toString();
    try {
      return await request<{ total: number; listings: LandListing[] }>(`/listings${qs ? `?${qs}` : ''}`);
    } catch (error) {
      if (!isApiUnavailable(error)) throw error;

      console.error('Listings API is unavailable; showing bundled demo listings.', error);
      let listings = INITIAL_LISTINGS.filter((listing) => listing.publicationStatus === 'published');

      if (filters.districtId) {
        listings = listings.filter((listing) => listing.districtId === filters.districtId);
      }
      if (filters.administrativeUnitId) {
        listings = listings.filter((listing) => listing.administrativeUnitId === filters.administrativeUnitId);
      }
      if (filters.category && filters.category !== 'all') {
        listings = listings.filter((listing) => listing.category === filters.category);
      }
      if (filters.availability && filters.availability !== 'all') {
        listings = listings.filter((listing) => listing.availability === filters.availability);
      }
      if (filters.minPriceUgx !== undefined && filters.minPriceUgx > 0) {
        listings = listings.filter((listing) => listing.priceUgx >= filters.minPriceUgx!);
      }
      if (filters.maxPriceUgx !== undefined && filters.maxPriceUgx > 0) {
        listings = listings.filter((listing) => listing.priceUgx <= filters.maxPriceUgx!);
      }
      if (filters.query?.trim()) {
        const query = filters.query.toLowerCase().trim();
        listings = listings.filter((listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.referenceNumber.toLowerCase().includes(query) ||
          listing.districtName.toLowerCase().includes(query) ||
          listing.administrativeUnitName.toLowerCase().includes(query) ||
          listing.parishOrWard?.toLowerCase().includes(query) ||
          listing.villageOrLocality?.toLowerCase().includes(query)
        );
      }

      if (filters.sortBy === 'price_asc') {
        listings.sort((a, b) => a.priceUgx - b.priceUgx);
      } else if (filters.sortBy === 'price_desc') {
        listings.sort((a, b) => b.priceUgx - a.priceUgx);
      } else if (filters.sortBy === 'size_desc') {
        listings.sort((a, b) => b.landSize - a.landSize);
      } else {
        listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return { total: listings.length, listings, isDemoFallback: true };
    }
  },

  async getListingById(idOrRef: string): Promise<LandListing> {
    const res = await request<{ listing: LandListing }>(`/listings/${encodeURIComponent(idOrRef)}`);
    return res.listing;
  },

  async submitSiteVisit(data: {
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
  }): Promise<{ message: string; visit: SiteVisitRequest }> {
    return request<{ message: string; visit: SiteVisitRequest }>('/site-visits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async recordInquiry(data: {
    listingId?: string;
    listingReference?: string;
    inquiryType: 'whatsapp_listing' | 'whatsapp_site_visit' | 'general_contact';
    visitorName?: string;
    visitorContact?: string;
    notes?: string;
  }): Promise<{ success: boolean; inquiryId: string }> {
    return request<{ success: boolean; inquiryId: string }>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==========================================
  // Admin Authentication & Session
  // ==========================================
  async adminLogin(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await request<{ token: string; user: AdminUser }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAdminToken(res.token);
    return res;
  },

  async adminLogout(): Promise<{ success: boolean }> {
    try {
      await request<{ success: boolean }>('/admin/logout', { method: 'POST' });
    } finally {
      clearAdminToken();
    }
    return { success: true };
  },

  async adminForgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    return request<{ success: boolean; message: string; resetToken?: string }>('/admin/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async adminResetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    });
  },

  async adminGetMe(): Promise<{ user: AdminUser }> {
    return request<{ user: AdminUser }>('/admin/me');
  },

  async adminUpdateOwnPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/admin/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // ==========================================
  // Protected Management Operations
  // ==========================================
  async adminGetMetrics(): Promise<{ metrics: any }> {
    return request<{ metrics: any }>('/admin/metrics');
  },

  async adminGetListings(filters: Partial<SearchFilters> = {}): Promise<LandListing[]> {
    const params = new URLSearchParams();
    if (filters.districtId) params.append('districtId', filters.districtId);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.availability && filters.availability !== 'all') params.append('availability', filters.availability);
    if (filters.query) params.append('query', filters.query);

    const qs = params.toString();
    const res = await request<{ listings: LandListing[] }>(`/admin/listings${qs ? `?${qs}` : ''}`);
    return res.listings;
  },

  async adminCreateListing(listing: any): Promise<LandListing> {
    const res = await request<{ listing: LandListing }>('/admin/listings', {
      method: 'POST',
      body: JSON.stringify(listing),
    });
    return res.listing;
  },

  async adminUpdateListing(id: string, updates: any): Promise<LandListing> {
    const res = await request<{ listing: LandListing }>(`/admin/listings/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.listing;
  },

  async adminDeleteListing(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/admin/listings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  async adminToggleAvailability(id: string, availability: string): Promise<LandListing> {
    const res = await request<{ listing: LandListing }>(`/admin/listings/${encodeURIComponent(id)}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ availability }),
    });
    return res.listing;
  },

  async adminTogglePublish(id: string, publicationStatus: string): Promise<LandListing> {
    const res = await request<{ listing: LandListing }>(`/admin/listings/${encodeURIComponent(id)}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ publicationStatus }),
    });
    return res.listing;
  },

  async adminGetDistricts(): Promise<District[]> {
    const res = await request<{ districts: District[] }>('/admin/districts');
    return res.districts;
  },

  async adminCreateDistrict(data: Partial<District>): Promise<District> {
    const res = await request<{ district: District }>('/admin/districts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.district;
  },

  async adminUpdateDistrict(id: string, data: Partial<District>): Promise<District> {
    const res = await request<{ district: District }>(`/admin/districts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.district;
  },

  async adminGetAdministrativeUnits(districtId?: string): Promise<AdministrativeUnit[]> {
    const query = districtId ? `?districtId=${encodeURIComponent(districtId)}` : '';
    const res = await request<{ units: AdministrativeUnit[] }>(`/admin/administrative-units${query}`);
    return res.units;
  },

  async adminCreateAdministrativeUnit(data: Partial<AdministrativeUnit>): Promise<AdministrativeUnit> {
    const res = await request<{ unit: AdministrativeUnit }>('/admin/administrative-units', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.unit;
  },

  async adminUpdateAdministrativeUnit(id: string, data: Partial<AdministrativeUnit>): Promise<AdministrativeUnit> {
    const res = await request<{ unit: AdministrativeUnit }>(`/admin/administrative-units/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.unit;
  },

  async adminGetSiteVisits(): Promise<SiteVisitRequest[]> {
    const res = await request<{ visits: SiteVisitRequest[] }>('/admin/site-visits');
    return res.visits;
  },

  async adminUpdateSiteVisitStatus(id: string, status: string): Promise<SiteVisitRequest> {
    const res = await request<{ visit: SiteVisitRequest }>(`/admin/site-visits/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.visit;
  },

  async adminGetInquiries(): Promise<InquiryRecord[]> {
    const res = await request<{ inquiries: InquiryRecord[] }>('/admin/inquiries');
    return res.inquiries;
  },

  // Staff and Permissions (Super Admin only)
  async adminGetStaff(): Promise<AdminUser[]> {
    const res = await request<{ staff: AdminUser[] }>('/admin/staff');
    return res.staff;
  },

  async adminCreateStaff(data: { email: string; fullName: string; role: AdminRole; initialPassword: string }): Promise<AdminUser> {
    const res = await request<{ user: AdminUser }>('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.user;
  },

  async adminUpdateStaffRole(id: string, role: AdminRole): Promise<AdminUser> {
    const res = await request<{ user: AdminUser }>(`/admin/staff/${encodeURIComponent(id)}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return res.user;
  },

  async adminUpdateStaffStatus(id: string, isActive: boolean): Promise<AdminUser> {
    const res = await request<{ user: AdminUser }>(`/admin/staff/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
    return res.user;
  },

  async adminGetAuditLogs(): Promise<AuditLog[]> {
    const res = await request<{ logs: AuditLog[] }>('/admin/audit-logs');
    return res.logs;
  },

  async adminUploadMedia(base64Data: string, filename: string, mediaType: 'photo' | 'video'): Promise<{ url: string; filename: string }> {
    return request<{ url: string; filename: string }>('/admin/upload-media', {
      method: 'POST',
      body: JSON.stringify({ base64Data, filename, mediaType }),
    });
  }
};
