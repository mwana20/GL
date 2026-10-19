import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Users, 
  Shield, 
  Key, 
  LogOut, 
  Camera, 
  Video, 
  AlertCircle, 
  Search, 
  ExternalLink, 
  Eye, 
  FileCheck2,
  RefreshCw,
  MessageCircle,
  Phone,
  LayoutDashboard,
  Map,
  UserCheck,
  History,
  Lock,
  ArrowRight,
  UserPlus,
  ShieldAlert,
  Sliders,
  Check,
  ChevronRight,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { 
  LandListing, 
  District, 
  AdministrativeUnit, 
  SiteVisitRequest, 
  InquiryRecord, 
  AuditLog, 
  LandUseCategory, 
  LandMeasurementUnit, 
  LandTenureType,
  UgandaRegion,
  AdministrativeUnitType,
  AdminUser,
  AdminRole
} from '../types';
import { api, clearAdminToken } from '../services/api';
import { formatUgx, formatLandSize } from '../utils/formatters';

interface AdminDashboardProps {
  initialSubpath?: string;
  onViewPublicListing: (listing: LandListing) => void;
  onGoToPublicSite: () => void;
  onLogout?: () => void;
}

// Admin Navigation Sections
export type AdminSection = 
  | 'overview' 
  | 'listings' 
  | 'add-listing' 
  | 'geography' 
  | 'inquiries' 
  | 'visits' 
  | 'staff' 
  | 'logs' 
  | 'settings';

function resolveAdminSection(pathname?: string): AdminSection {
  if (!pathname) return 'overview';
  const clean = pathname.toLowerCase();
  if (clean.includes('/admin/listings') || clean.includes('/admin/plots')) return 'listings';
  if (clean.includes('/admin/add-listing') || clean.includes('/admin/new')) return 'add-listing';
  if (clean.includes('/admin/geography') || clean.includes('/admin/districts') || clean.includes('/admin/subcounties')) return 'geography';
  if (clean.includes('/admin/visits') || clean.includes('/admin/site-visits')) return 'visits';
  if (clean.includes('/admin/inquiries') || clean.includes('/admin/leads')) return 'inquiries';
  if (clean.includes('/admin/staff') || clean.includes('/admin/users') || clean.includes('/admin/permissions')) return 'staff';
  if (clean.includes('/admin/logs') || clean.includes('/admin/activity') || clean.includes('/admin/audit')) return 'logs';
  if (clean.includes('/admin/settings') || clean.includes('/admin/account')) return 'settings';
  return 'overview';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialSubpath,
  onViewPublicListing,
  onGoToPublicSite,
  onLogout,
}) => {
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Login Form State
  const [emailInput, setEmailInput] = useState('superadmin@glrealestates.com');
  const [passwordInput, setPasswordInput] = useState('GloriousSuperAdmin2026!');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Forgot Password State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [resetTokenReceived, setResetTokenReceived] = useState('');
  const [newPasswordAfterReset, setNewPasswordAfterReset] = useState('');

  // Intended section to return to after authentication
  const [intendedSection, setIntendedSection] = useState<AdminSection>(() => 
    resolveAdminSection(initialSubpath || (typeof window !== 'undefined' ? window.location.pathname : ''))
  );
  const [activeSection, setActiveSection] = useState<AdminSection>(() => 
    resolveAdminSection(initialSubpath || (typeof window !== 'undefined' ? window.location.pathname : ''))
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigateToSection = (sec: AdminSection) => {
    setActiveSection(sec);
    setMobileSidebarOpen(false);
    const targetUrl = sec === 'overview' ? '/admin' : `/admin/${sec}`;
    if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  };

  // Operational Data
  const [metrics, setMetrics] = useState<any>(null);
  const [listings, setListings] = useState<LandListing[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [adminUnits, setAdminUnits] = useState<AdministrativeUnit[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisitRequest[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [staffUsers, setStaffUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Action notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Check existing session on boot & handle popstate
  useEffect(() => {
    setAuthChecking(true);
    api.adminGetMe()
      .then((res) => {
        setIsAuthenticated(true);
        setCurrentUser(res.user);
        loadAllData(res.user);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setCurrentUser(null);
      })
      .finally(() => setAuthChecking(false));

    // Listen for session expiration events
    const handleExpired = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/admin');
      }
      showFeedback('error', 'Your session expired. Please sign in again.');
    };
    window.addEventListener('gl_session_expired', handleExpired);

    // Browser back/forward navigation within admin
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const sec = resolveAdminSection(window.location.pathname);
        setActiveSection(sec);
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('gl_session_expired', handleExpired);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const loadAllData = (user: AdminUser) => {
    loadMetrics();

    if (user.role === 'super_admin' || user.role === 'property_manager') {
      loadListings();
      loadGeography();
    }

    // All roles can see site visits and inquiries
    loadVisitsAndInquiries();

    if (user.role === 'super_admin') {
      loadStaff();
      loadAuditLogs();
    }
  };

  const loadMetrics = () => api.adminGetMetrics().then(r => setMetrics(r.metrics)).catch(console.error);
  const loadListings = () => api.adminGetListings().then(l => setListings(l)).catch(console.error);
  const loadGeography = () => {
    api.adminGetDistricts().then(d => setDistricts(d.sort((a, b) => a.name.localeCompare(b.name)))).catch(console.error);
    api.adminGetAdministrativeUnits().then(u => setAdminUnits(u)).catch(console.error);
  };
  const loadVisitsAndInquiries = () => {
    api.adminGetSiteVisits().then(v => setSiteVisits(v)).catch(console.error);
    api.adminGetInquiries().then(i => setInquiries(i)).catch(console.error);
  };
  const loadStaff = () => api.adminGetStaff().then(s => setStaffUsers(s)).catch(console.error);
  const loadAuditLogs = () => api.adminGetAuditLogs().then(l => setAuditLogs(l)).catch(console.error);

  // Authentication Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await api.adminLogin(emailInput.trim(), passwordInput);
      setIsAuthenticated(true);
      setCurrentUser(res.user);
      loadAllData(res.user);

      // Return to intended section if permitted by role
      let targetSec = intendedSection;
      if ((targetSec === 'staff' || targetSec === 'logs') && res.user.role !== 'super_admin') {
        targetSec = 'overview';
      } else if ((targetSec === 'listings' || targetSec === 'add-listing' || targetSec === 'geography') && res.user.role === 'customer_support') {
        targetSec = 'overview';
      }
      setActiveSection(targetSec);
      if (typeof window !== 'undefined') {
        const targetUrl = targetSec === 'overview' ? '/admin' : `/admin/${targetSec}`;
        window.history.pushState({}, '', targetUrl);
      }
      showFeedback('success', `Welcome back, ${res.user.fullName}.`);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.adminLogout();
    } catch (e) {
      clearAdminToken();
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/admin');
    }
    showFeedback('success', 'Logged out securely from management console.');
    onLogout?.();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.adminForgotPassword(forgotEmail.trim());
      setForgotMsg(res.message);
      if (res.resetToken) {
        setResetTokenReceived(res.resetToken);
      }
    } catch (err: any) {
      setForgotMsg(err.message || 'Error requesting reset.');
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminResetPassword(resetTokenReceived, newPasswordAfterReset);
      showFeedback('success', 'Password reset successfully. Sign in with your new password.');
      setForgotModalOpen(false);
      setForgotEmail('');
      setResetTokenReceived('');
      setNewPasswordAfterReset('');
    } catch (err: any) {
      setForgotMsg(err.message);
    }
  };

  // Quick Account Credential Switcher for Evaluation
  const setTestAccount = (role: AdminRole) => {
    if (role === 'super_admin') {
      setEmailInput('superadmin@glrealestates.com');
      setPasswordInput('GloriousSuperAdmin2026!');
    } else if (role === 'property_manager') {
      setEmailInput('propertymanager@glrealestates.com');
      setPasswordInput('GloriousManager2026!');
    } else {
      setEmailInput('support@glrealestates.com');
      setPasswordInput('GloriousSupport2026!');
    }
  };

  // ==========================================
  // LISTING CREATION / EDITING STATE
  // ==========================================
  const [editingListing, setEditingListing] = useState<LandListing | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriceUgx, setFormPriceUgx] = useState<number>(35000000);
  const [formLandSize, setFormLandSize] = useState<number>(50);
  const [formMeasurementUnit, setFormMeasurementUnit] = useState<LandMeasurementUnit>('decimals');
  const [formCategory, setFormCategory] = useState<LandUseCategory>('Residential Plot');
  const [formDistrictId, setFormDistrictId] = useState<string>('');
  const [formAdminUnitId, setFormAdminUnitId] = useState<string>('');
  const [formParish, setFormParish] = useState('');
  const [formVillage, setFormVillage] = useState('');
  const [formTenure, setFormTenure] = useState<LandTenureType>('Mailo Land (Private Mailo)');
  const [formRoadAccess, setFormRoadAccess] = useState('');
  const [formElectricity, setFormElectricity] = useState(true);
  const [formWater, setFormWater] = useState(true);
  const [formTopography, setFormTopography] = useState('');
  const [formAvailability, setFormAvailability] = useState<'available' | 'reserved' | 'sold'>('available');
  const [formPublicationStatus, setFormPublicationStatus] = useState<'published' | 'draft' | 'unpublished'>('published');
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // 3 Photos + 1 Video State
  const [photo1Url, setPhoto1Url] = useState('/images/uganda_plot_residential_1792429858634.jpg');
  const [photo2Url, setPhoto2Url] = useState('/images/uganda_plot_access_road_1792429877467.jpg');
  const [photo3Url, setPhoto3Url] = useState('/images/uganda_plot_detail_boundary_1792429877540.jpg');
  const [videoUrl, setVideoUrl] = useState('https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4');
  const [formError, setFormError] = useState('');
  const [listingModalOpen, setListingModalOpen] = useState(false);

  const startNewListing = () => {
    setEditingListing(null);
    setFormTitle('');
    setFormDescription('');
    setFormPriceUgx(30000000);
    setFormLandSize(50);
    setFormMeasurementUnit('decimals');
    setFormCategory('Residential Plot');
    setFormDistrictId(districts[0]?.id || '');
    setFormAdminUnitId('');
    setFormParish('');
    setFormVillage('');
    setFormTenure('Mailo Land (Private Mailo)');
    setFormRoadAccess('30ft graded murram access road');
    setFormElectricity(true);
    setFormWater(true);
    setFormTopography('Gentle slope with panoramic valley view');
    setFormAvailability('available');
    setFormPublicationStatus('published');
    setFormIsFeatured(false);
    setPhoto1Url('/images/uganda_plot_residential_1792429858634.jpg');
    setPhoto2Url('/images/uganda_plot_access_road_1792429877467.jpg');
    setPhoto3Url('/images/uganda_plot_detail_boundary_1792429877540.jpg');
    setVideoUrl('https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4');
    setFormError('');
    navigateToSection('add-listing');
  };

  const startEditListing = (listing: LandListing) => {
    setEditingListing(listing);
    setFormTitle(listing.title);
    setFormDescription(listing.description);
    setFormPriceUgx(listing.priceUgx);
    setFormLandSize(listing.landSize);
    setFormMeasurementUnit(listing.measurementUnit);
    setFormCategory(listing.category);
    setFormDistrictId(listing.districtId);
    setFormAdminUnitId(listing.administrativeUnitId);
    setFormParish(listing.parishOrWard || '');
    setFormVillage(listing.villageOrLocality || '');
    setFormTenure(listing.tenureType || 'Mailo Land (Private Mailo)');
    setFormRoadAccess(listing.roadAccess || '');
    setFormElectricity(listing.electricityAvailable ?? true);
    setFormWater(listing.waterAvailable ?? true);
    setFormTopography(listing.topography || '');
    setFormAvailability(listing.availability);
    setFormPublicationStatus(listing.publicationStatus);
    setFormIsFeatured(listing.isFeatured);

    const photos = listing.media.filter((m) => m.mediaType === 'photo');
    const vid = listing.media.find((m) => m.mediaType === 'video');

    setPhoto1Url(photos[0]?.url || '');
    setPhoto2Url(photos[1]?.url || '');
    setPhoto3Url(photos[2]?.url || '');
    setVideoUrl(vid?.url || '');

    setFormError('');
    navigateToSection('add-listing');
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('Plot title is required.');
      return;
    }

    if (!formDistrictId || !formAdminUnitId) {
      setFormError('Please select both a district and a subcounty.');
      return;
    }

    // STRICT MEDIA ENFORCEMENT
    if (formPublicationStatus === 'published') {
      if (!photo1Url.trim() || !photo2Url.trim() || !photo3Url.trim()) {
        setFormError('Strict Validation: Every published listing must have EXACTLY 3 valid photographs.');
        return;
      }
      if (!videoUrl.trim()) {
        setFormError('Strict Validation: Every published listing must have EXACTLY 1 property video.');
        return;
      }
    }

    const media = [
      { id: `med_${Date.now()}_1`, listingId: editingListing?.id || '', mediaType: 'photo' as const, url: photo1Url.trim(), displayOrder: 1, caption: 'Primary front view' },
      { id: `med_${Date.now()}_2`, listingId: editingListing?.id || '', mediaType: 'photo' as const, url: photo2Url.trim(), displayOrder: 2, caption: 'Access road & neighborhood' },
      { id: `med_${Date.now()}_3`, listingId: editingListing?.id || '', mediaType: 'photo' as const, url: photo3Url.trim(), displayOrder: 3, caption: 'Survey boundary beacon' },
      { id: `med_${Date.now()}_4`, listingId: editingListing?.id || '', mediaType: 'video' as const, url: videoUrl.trim(), displayOrder: 4, caption: 'Video walkthrough' }
    ];

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      priceUgx: Number(formPriceUgx),
      landSize: Number(formLandSize),
      measurementUnit: formMeasurementUnit,
      category: formCategory,
      districtId: formDistrictId,
      administrativeUnitId: formAdminUnitId,
      parishOrWard: formParish.trim() || undefined,
      villageOrLocality: formVillage.trim() || undefined,
      tenureType: formTenure,
      roadAccess: formRoadAccess.trim() || undefined,
      electricityAvailable: formElectricity,
      waterAvailable: formWater,
      topography: formTopography.trim() || undefined,
      availability: formAvailability,
      publicationStatus: formPublicationStatus,
      isFeatured: formIsFeatured,
      media
    };

    try {
      if (editingListing) {
        await api.adminUpdateListing(editingListing.id, payload);
        showFeedback('success', `Updated listing ${editingListing.referenceNumber}`);
      } else {
        const created = await api.adminCreateListing(payload);
        showFeedback('success', `Created new listing ${created.referenceNumber}`);
      }
      loadListings();
      loadMetrics();
      navigateToSection('listings');
    } catch (err: any) {
      setFormError(err.message || 'Failed to save listing');
    }
  };

  const handleDeleteListing = async (id: string, ref: string) => {
    if (window.confirm(`Are you sure you want to delete listing ${ref}?`)) {
      try {
        await api.adminDeleteListing(id);
        showFeedback('success', `Deleted listing ${ref}`);
        loadListings();
        loadMetrics();
      } catch (err: any) {
        showFeedback('error', err.message);
      }
    }
  };

  const handleTogglePublish = async (listing: LandListing) => {
    const nextStatus = listing.publicationStatus === 'published' ? 'unpublished' : 'published';
    try {
      await api.adminTogglePublish(listing.id, nextStatus);
      showFeedback('success', `Listing ${listing.referenceNumber} is now ${nextStatus}`);
      loadListings();
      loadMetrics();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleToggleAvailability = async (listing: LandListing, status: 'available' | 'reserved' | 'sold') => {
    try {
      await api.adminToggleAvailability(listing.id, status);
      showFeedback('success', `Marked ${listing.referenceNumber} as ${status}`);
      loadListings();
      loadMetrics();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleSiteVisitStatusChange = async (visitId: string, status: string) => {
    try {
      await api.adminUpdateSiteVisitStatus(visitId, status);
      showFeedback('success', `Site visit status changed to ${status}`);
      loadVisitsAndInquiries();
      loadMetrics();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  // ==========================================
  // STAFF MANAGEMENT (SUPER ADMIN ONLY)
  // ==========================================
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffFullName, setNewStaffFullName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<AdminRole>('property_manager');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [staffModalOpen, setStaffModalOpen] = useState(false);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminCreateStaff({
        email: newStaffEmail.trim(),
        fullName: newStaffFullName.trim(),
        role: newStaffRole,
        initialPassword: newStaffPassword
      });
      showFeedback('success', `Staff account created for ${newStaffEmail}`);
      setStaffModalOpen(false);
      setNewStaffEmail('');
      setNewStaffFullName('');
      setNewStaffPassword('');
      loadStaff();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleChangeStaffRole = async (userId: string, newRole: AdminRole) => {
    try {
      await api.adminUpdateStaffRole(userId, newRole);
      showFeedback('success', 'Staff role updated successfully.');
      loadStaff();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleToggleStaffStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.adminUpdateStaffStatus(userId, !currentStatus);
      showFeedback('success', `Account ${!currentStatus ? 'activated' : 'deactivated'}.`);
      loadStaff();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  // ==========================================
  // ACCOUNT SETTINGS
  // ==========================================
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const handleChangeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg('');
    try {
      const res = await api.adminUpdateOwnPassword(currentPwd, newPwd);
      setPwdMsg(res.message);
      setCurrentPwd('');
      setNewPwd('');
      showFeedback('success', 'Your password was updated successfully.');
    } catch (err: any) {
      setPwdMsg(err.message);
    }
  };

  // ==========================================
  // GEOGRAPHY STATE
  // ==========================================
  const [selectedGeoDistrictId, setSelectedGeoDistrictId] = useState<string>('');
  const [geoDistrictSearch, setGeoDistrictSearch] = useState('');
  const [districtModalOpen, setDistrictModalOpen] = useState(false);
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState('');
  const [newDistrictRegion, setNewDistrictRegion] = useState<UgandaRegion>('Central');
  const [newDistrictCode, setNewDistrictCode] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitType, setNewUnitType] = useState<AdministrativeUnitType>('Subcounty');

  const filteredDistricts = districts.filter(
    (d) =>
      d.name.toLowerCase().includes(geoDistrictSearch.toLowerCase()) ||
      d.region.toLowerCase().includes(geoDistrictSearch.toLowerCase())
  );
  const selectedGeoDistrict = districts.find((d) => d.id === selectedGeoDistrictId);
  const selectedDistrictUnits = adminUnits.filter((u) => u.districtId === selectedGeoDistrictId);
  const modalSubcounties = adminUnits.filter((u) => u.districtId === formDistrictId);

  const handleCreateDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrictName.trim()) return;
    try {
      await api.adminCreateDistrict({
        name: newDistrictName.trim(),
        region: newDistrictRegion,
        code: newDistrictCode.trim() || undefined,
        isActive: true
      });
      setDistrictModalOpen(false);
      setNewDistrictName('');
      setNewDistrictCode('');
      loadGeography();
      showFeedback('success', `Added district ${newDistrictName}`);
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleCreateAdminUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim() || !selectedGeoDistrictId) return;
    try {
      await api.adminCreateAdministrativeUnit({
        districtId: selectedGeoDistrictId,
        name: newUnitName.trim(),
        unitType: newUnitType,
        isActive: true
      });
      setUnitModalOpen(false);
      setNewUnitName('');
      loadGeography();
      showFeedback('success', `Added ${newUnitType} '${newUnitName}' to ${selectedGeoDistrict?.name}`);
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  // Role Permissions Checking
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const canManageListings = currentUser?.role === 'super_admin' || currentUser?.role === 'property_manager';
  const isCustomerSupport = currentUser?.role === 'customer_support';

  // -------------------------------------------------------------
  // RENDER: UNAUTHENTICATED PRIVATE ADMIN LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between overflow-hidden">
        {/* Full-bleed Ugandan Estate Landscape Background Image (Bright & Clearly Visible) */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/admin_login_backdrop_1792434291314.jpg"
            alt="GL Real Estates surveyed land plots and rolling hills"
            className="w-full h-full object-cover object-center brightness-95 contrast-105"
          />
          {/* Subtle 30% overlay scrim to preserve landscape vibrancy while ensuring contrast */}
          <div className="absolute inset-0 bg-neutral-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-neutral-950/40" />
        </div>

        {/* Top Minimal Admin Bar */}
        <header className="relative z-10 border-b border-white/10 bg-neutral-950/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
              GL
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">GL Real Estates</span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">Private Staff Gateway · /admin</span>
            </div>
          </div>

          <button
            onClick={onGoToPublicSite}
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Go to Public Website</span>
          </button>
        </header>

        {/* Central Secure Login Box */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
          <div className="max-w-md w-full bg-neutral-900/90 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 ring-1 ring-white/10">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-neutral-800/90 border border-neutral-700 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Staff Operations Portal
              </h1>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Authorized staff sign-in with role-based access control. Public self-registration is disabled.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/80 border border-red-800/80 text-xs text-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Staff Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@glrealestates.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-neutral-950/80 border border-neutral-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all placeholder:text-neutral-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-neutral-950/80 border border-neutral-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all placeholder:text-neutral-500"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loggingIn ? 'Verifying Authorization...' : 'Authenticate & Open Dashboard'}
              </button>
            </form>

            {/* Role Credentials Reference for Evaluation */}
            <div className="pt-4 border-t border-neutral-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block text-center">
                Pre-Configured Staff Roles (Click to Fill)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTestAccount('super_admin')}
                  className="p-2 rounded-lg bg-neutral-800/90 hover:bg-neutral-700/90 text-[10px] text-neutral-300 hover:text-white text-center border border-neutral-700 transition-colors"
                >
                  <span className="font-bold text-amber-400 block">Super Admin</span>
                  <span>Full Control</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTestAccount('property_manager')}
                  className="p-2 rounded-lg bg-neutral-800/90 hover:bg-neutral-700/90 text-[10px] text-neutral-300 hover:text-white text-center border border-neutral-700 transition-colors"
                >
                  <span className="font-bold text-emerald-400 block">Property Mgr</span>
                  <span>Listings & Media</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTestAccount('customer_support')}
                  className="p-2 rounded-lg bg-neutral-800/90 hover:bg-neutral-700/90 text-[10px] text-neutral-300 hover:text-white text-center border border-neutral-700 transition-colors"
                >
                  <span className="font-bold text-blue-400 block">Support Rep</span>
                  <span>Visits & Leads</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-neutral-950/50 backdrop-blur-md py-4 px-6 text-center text-xs text-neutral-400">
          GL Real Estates Management Architecture · Strictly Protected Gateway · Access Logs Recorded
        </footer>

        {/* Forgot Password Modal */}
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
              <h3 className="text-base font-bold text-white">Staff Password Reset</h3>
              <p className="text-neutral-400">
                Authorized accounts can request a single-use token to update their password.
              </p>

              {forgotMsg && (
                <div className="p-2.5 rounded bg-neutral-800 text-neutral-200">
                  {forgotMsg}
                </div>
              )}

              {!resetTokenReceived ? (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 mb-1">Staff Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. superadmin@glrealestates.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(false)}
                      className="px-3 py-1.5 rounded text-neutral-400 hover:bg-neutral-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-600"
                    >
                      Generate Reset Instructions
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCompleteReset} className="space-y-3">
                  <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-200">
                    <span className="font-semibold block">Reset Token Active:</span>
                    <span className="font-mono text-[10px] break-all">{resetTokenReceived}</span>
                  </div>
                  <div>
                    <label className="block text-neutral-300 mb-1">New Password (Min 8 chars)</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="Enter new password"
                      value={newPasswordAfterReset}
                      onChange={(e) => setNewPasswordAfterReset(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-600"
                    >
                      Set New Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: AUTHENTICATED DEDICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col lg:flex-row">
      {/* 1A. MOBILE & TABLET SLIDING DRAWER BACKDROP (Slides from left to right up to 80% width) */}
      <div
        className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* 1B. MOBILE & TABLET SLIDING DRAWER (80% width, -translate-x-full to translate-x-0) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[80vw] max-w-[80%] bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Admin Navigation Drawer"
      >
        <div>
          {/* Drawer Header Lockup */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
                GL
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">GL Real Estates</span>
                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">Admin Management</span>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge */}
          <div className="p-4 bg-neutral-950/90 border-b border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
              {currentUser?.fullName.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">{currentUser?.fullName}</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded inline-block ${
                currentUser?.role === 'super_admin' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                currentUser?.role === 'property_manager' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
                'bg-blue-950 text-blue-300 border border-blue-800/60'
              }`}>
                {currentUser?.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] text-xs">
            {/* Overview */}
            <button
              onClick={() => navigateToSection('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                activeSection === 'overview'
                  ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Overview & Metrics</span>
            </button>

            {/* Manage Land Listings */}
            {canManageListings && (
              <>
                <button
                  onClick={() => navigateToSection('listings')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    activeSection === 'listings'
                      ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 shrink-0" />
                    <span>Manage Land Listings</span>
                  </div>
                  <span className="text-[10px] font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
                    {listings.length}
                  </span>
                </button>

                <button
                  onClick={startNewListing}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    activeSection === 'add-listing'
                      ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add New Plot (3P+1V)</span>
                </button>

                <button
                  onClick={() => navigateToSection('geography')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    activeSection === 'geography'
                      ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Map className="w-4 h-4 shrink-0" />
                  <span>Districts & Subcounties</span>
                </button>
              </>
            )}

            {/* Inquiries & Site Visits */}
            <button
              onClick={() => navigateToSection('visits')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                activeSection === 'visits'
                  ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Site-Visit Requests</span>
              </div>
              {siteVisits.length > 0 && (
                <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded">
                  {siteVisits.length}
                </span>
              )}
            </button>

            <button
              onClick={() => navigateToSection('inquiries')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                activeSection === 'inquiries'
                  ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Inquiries & Leads</span>
              </div>
              <span className="text-[10px] font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
                {inquiries.length}
              </span>
            </button>

            {/* Super Admin Restricted Areas */}
            {isSuperAdmin && (
              <>
                <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Administration & Access
                </div>

                <button
                  onClick={() => navigateToSection('staff')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    activeSection === 'staff'
                      ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>Staff & Permissions</span>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">
                    {staffUsers.length}
                  </span>
                </button>

                <button
                  onClick={() => navigateToSection('logs')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    activeSection === 'logs'
                      ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <History className="w-4 h-4 shrink-0" />
                  <span>Activity & Audit Logs</span>
                </button>
              </>
            )}

            {/* Account Settings */}
            <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Account
            </div>
            <button
              onClick={() => navigateToSection('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                activeSection === 'settings'
                  ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Account Security</span>
            </button>
          </nav>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 space-y-1.5 text-xs">
          <button
            onClick={() => {
              setMobileSidebarOpen(false);
              onGoToPublicSite();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Public Website</span>
          </button>

          <button
            onClick={() => {
              setMobileSidebarOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 1C. DESKTOP PERMANENT SIDEBAR (Visible only on lg+ screens) */}
      <aside className="hidden lg:flex lg:w-64 bg-neutral-900 border-r border-neutral-800 flex-col shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Brand Lockup */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
              GL
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">GL Real Estates</span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">Admin Management</span>
            </div>
          </div>
        </div>

        {/* Authenticated User Badge */}
        <div className="p-4 bg-neutral-950/60 border-b border-neutral-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
            {currentUser?.fullName.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-white block truncate">{currentUser?.fullName}</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded inline-block ${
              currentUser?.role === 'super_admin' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
              currentUser?.role === 'property_manager' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
              'bg-blue-950 text-blue-300 border border-blue-800/60'
            }`}>
              {currentUser?.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Management Navigation Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto text-xs">
          {/* Overview */}
          <button
            onClick={() => navigateToSection('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors ${
              activeSection === 'overview'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Overview & Metrics</span>
          </button>

          {/* Manage Land Listings (Super Admin & Property Manager) */}
          {canManageListings && (
            <>
              <button
                onClick={() => navigateToSection('listings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  activeSection === 'listings'
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 shrink-0" />
                  <span>Manage Land Listings</span>
                </div>
                <span className="text-[10px] font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
                  {listings.length}
                </span>
              </button>

              <button
                onClick={startNewListing}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  activeSection === 'add-listing'
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Add New Plot (3P+1V)</span>
              </button>

              <button
                onClick={() => navigateToSection('geography')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  activeSection === 'geography'
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Map className="w-4 h-4 shrink-0" />
                <span>Districts & Subcounties</span>
              </button>
            </>
          )}

          {/* Inquiries & Site Visits (All Roles) */}
          <button
            onClick={() => navigateToSection('visits')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
              activeSection === 'visits'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Site-Visit Requests</span>
            </div>
            {siteVisits.length > 0 && (
              <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded">
                {siteVisits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => navigateToSection('inquiries')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
              activeSection === 'inquiries'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Inquiries & Leads</span>
            </div>
            <span className="text-[10px] font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
              {inquiries.length}
            </span>
          </button>

          {/* Super Admin Restricted Areas */}
          {isSuperAdmin && (
            <>
              <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Administration & Access
              </div>

              <button
                onClick={() => navigateToSection('staff')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  activeSection === 'staff'
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Staff & Permissions</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">
                  {staffUsers.length}
                </span>
              </button>

              <button
                onClick={() => navigateToSection('logs')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  activeSection === 'logs'
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <History className="w-4 h-4 shrink-0" />
                <span>Activity & Audit Logs</span>
              </button>
            </>
          )}

          {/* Account Settings */}
          <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Account
          </div>
          <button
            onClick={() => navigateToSection('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-colors ${
              activeSection === 'settings'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>Account Security</span>
          </button>
        </nav>

        {/* Sidebar Footer: Return to Public Site & Sign Out */}
        <div className="p-3 border-t border-neutral-800 space-y-1 text-xs">
          <button
            onClick={onGoToPublicSite}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Public Website</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header (Includes Hamburger Button on Mobile & Tablet < lg) */}
        <header className="h-16 border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile & Tablet */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Open management menu"
            >
              <Menu className="w-5 h-5 text-emerald-400" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400 hidden sm:inline">Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-600 hidden sm:inline" />
              <span className="font-semibold text-white capitalize">{activeSection.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canManageListings && (
              <button
                onClick={startNewListing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Plot</span>
              </button>
            )}

            <button
              onClick={onGoToPublicSite}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              title="Visit public website"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Website</span>
            </button>
          </div>
        </header>

        {/* Feedback Banner */}
        {feedback && (
          <div className={`p-3 text-xs flex items-center justify-between border-b ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : 'bg-red-950/80 border-red-800 text-red-200'
          }`}>
            <span>{feedback.text}</span>
            <button onClick={() => setFeedback(null)} className="font-bold underline text-[10px]">
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Section Views */}
        <div className="p-6 space-y-8 flex-1">
          {/* ====================================================
              SECTION: OVERVIEW & METRICS
              ==================================================== */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Operations Overview
                </h2>
                <p className="text-xs text-neutral-400">
                  Key platform metrics for GL Real Estates (Glorious Living) land operations across Uganda.
                </p>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Total Listings</span>
                  <div className="text-2xl font-bold text-white tabular-nums">{metrics?.totalListings ?? listings.length}</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Published</span>
                  <div className="text-2xl font-bold text-emerald-400 tabular-nums">{metrics?.publishedListings ?? 0}</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Available</span>
                  <div className="text-2xl font-bold text-white tabular-nums">{metrics?.availableListings ?? 0}</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Reserved</span>
                  <div className="text-2xl font-bold text-amber-400 tabular-nums">{metrics?.reservedListings ?? 0}</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Sold</span>
                  <div className="text-2xl font-bold text-neutral-300 tabular-nums">{metrics?.soldListings ?? 0}</div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-400">Site Visits</span>
                  <div className="text-2xl font-bold text-blue-400 tabular-nums">{metrics?.totalSiteVisits ?? siteVisits.length}</div>
                </div>
              </div>

              {/* Role Scope Notice */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3 text-xs">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">
                    Signed in as: {currentUser?.fullName} ({currentUser?.role.replace('_', ' ')})
                  </span>
                  <p className="text-neutral-400 leading-relaxed">
                    {currentUser?.role === 'super_admin' && 'Full administrative authority: manage listings, modify Uganda administrative geography, oversee staff permissions, and inspect system audit trails.'}
                    {currentUser?.role === 'property_manager' && 'Property management access: create and update land plots, inspect media conformance (3 photos + 1 video), and update availability status.'}
                    {currentUser?.role === 'customer_support' && 'Customer relations access: review incoming inquiries and manage site-visit scheduling requests.'}
                  </p>
                </div>
              </div>

              {/* Recent Pending Visits Quick Table */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">Pending Site-Visit Requests</h3>
                  <button onClick={() => setActiveSection('visits')} className="text-xs text-emerald-400 hover:underline">
                    View all ({siteVisits.length})
                  </button>
                </div>

                {siteVisits.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-neutral-400 uppercase text-[10px] border-b border-neutral-800 pb-2">
                        <tr>
                          <th className="py-2">Plot Ref</th>
                          <th className="py-2">Visitor</th>
                          <th className="py-2">Phone</th>
                          <th className="py-2">Preferred Date</th>
                          <th className="py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {siteVisits.slice(0, 5).map((v) => (
                          <tr key={v.id} className="hover:bg-neutral-800/50">
                            <td className="py-2.5 font-mono text-emerald-400 font-bold">{v.listingReference}</td>
                            <td className="py-2.5 text-white font-medium">{v.visitorName}</td>
                            <td className="py-2.5 text-neutral-300">{v.visitorPhone || '—'}</td>
                            <td className="py-2.5 text-neutral-300">{v.preferredDate} ({v.preferredTime})</td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800/50">
                                {v.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 py-4 text-center">No site visit requests logged yet.</p>
                )}
              </div>
            </div>
          )}

          {/* ====================================================
              SECTION: MANAGE LAND LISTINGS
              ==================================================== */}
          {activeSection === 'listings' && canManageListings && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Land Listings Management</h2>
                  <p className="text-xs text-neutral-400">Total {listings.length} registered plots in database.</p>
                </div>
                <button
                  onClick={startNewListing}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Plot</span>
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 font-semibold uppercase text-[10px] border-b border-neutral-800">
                      <tr>
                        <th className="py-3 px-4">Ref</th>
                        <th className="py-3 px-4">Property Title</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Size</th>
                        <th className="py-3 px-4">Price (UGX)</th>
                        <th className="py-3 px-4">Media</th>
                        <th className="py-3 px-4">Availability</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {listings.map((l) => {
                        const photosCount = l.media.filter((m) => m.mediaType === 'photo').length;
                        const videoCount = l.media.filter((m) => m.mediaType === 'video').length;
                        const isComplete = photosCount === 3 && videoCount === 1;

                        return (
                          <tr key={l.id} className="hover:bg-neutral-800/50">
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">{l.referenceNumber}</td>
                            <td className="py-3 px-4 max-w-xs">
                              <span className="font-semibold text-white block truncate">{l.title}</span>
                              <span className="text-[11px] text-neutral-400">{l.category}</span>
                            </td>
                            <td className="py-3 px-4 text-neutral-300">
                              {l.districtName}, {l.administrativeUnitName}
                            </td>
                            <td className="py-3 px-4 font-medium text-neutral-200">
                              {formatLandSize(l.landSize, l.measurementUnit)}
                            </td>
                            <td className="py-3 px-4 font-bold text-white tabular-nums">
                              {formatUgx(l.priceUgx)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 font-medium ${
                                isComplete ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                <Camera className="w-3 h-3" />
                                <span>{photosCount}P</span>
                                <span aria-hidden="true">·</span>
                                <Video className="w-3 h-3" />
                                <span>{videoCount}V</span>
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={l.availability}
                                onChange={(e) => handleToggleAvailability(l, e.target.value as any)}
                                className="bg-neutral-950 text-[11px] font-semibold text-white rounded px-2 py-1 border border-neutral-700"
                              >
                                <option value="available">Available</option>
                                <option value="reserved">Reserved</option>
                                <option value="sold">Sold</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleTogglePublish(l)}
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  l.publicationStatus === 'published'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                                }`}
                              >
                                {l.publicationStatus}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => onViewPublicListing(l)}
                                className="p-1 text-neutral-400 hover:text-white"
                                title="View in public layout"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => startEditListing(l)}
                                className="p-1 text-neutral-400 hover:text-emerald-400"
                                title="Edit Listing"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {isSuperAdmin && (
                                <button
                                  onClick={() => handleDeleteListing(l.id, l.referenceNumber)}
                                  className="p-1 text-neutral-500 hover:text-red-400"
                                  title="Delete Listing (Super Admin)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              SECTION: ADD / EDIT LISTING (3 PHOTOS + 1 VIDEO ENFORCED)
              ==================================================== */}
          {activeSection === 'add-listing' && canManageListings && (
            <div className="max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingListing ? `Edit Listing: ${editingListing.referenceNumber}` : 'Create New Land Listing'}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Published listings require strictly 3 photographs and 1 property video.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('listings')}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveListing} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Plot Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surveyed 50 Decimals Residential Plot in Kira"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detailed description of terrain, access road, neighborhood, legal title..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">Price in UGX *</label>
                    <input
                      type="number"
                      required
                      min="1000000"
                      step="500000"
                      value={formPriceUgx}
                      onChange={(e) => setFormPriceUgx(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">Land Size *</label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="0.1"
                      value={formLandSize}
                      onChange={(e) => setFormLandSize(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">Measurement Unit *</label>
                    <select
                      value={formMeasurementUnit}
                      onChange={(e) => setFormMeasurementUnit(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="decimals">Decimals</option>
                      <option value="acres">Acres</option>
                      <option value="sq meters">Square Meters</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="Residential Plot">Residential Plot</option>
                      <option value="Commercial Land">Commercial Land</option>
                      <option value="Agricultural Land">Agricultural Land</option>
                      <option value="Mixed-Use Land">Mixed-Use Land</option>
                      <option value="Industrial Land">Industrial Land</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">Tenure / Title Type</label>
                    <select
                      value={formTenure}
                      onChange={(e) => setFormTenure(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="Mailo Land (Private Mailo)">Mailo Land (Private Mailo)</option>
                      <option value="Freehold">Freehold</option>
                      <option value="Leasehold">Leasehold</option>
                      <option value="Customary">Customary</option>
                    </select>
                  </div>
                </div>

                {/* Geography Cascader */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">District *</label>
                    <select
                      value={formDistrictId}
                      onChange={(e) => {
                        setFormDistrictId(e.target.value);
                        setFormAdminUnitId('');
                      }}
                      required
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.region})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">Subcounty / Division *</label>
                    <select
                      value={formAdminUnitId}
                      onChange={(e) => setFormAdminUnitId(e.target.value)}
                      required
                      disabled={!formDistrictId}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white disabled:opacity-40"
                    >
                      <option value="">
                        {!formDistrictId ? 'Select District First' : 'Select Subcounty'}
                      </option>
                      {modalSubcounties.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.unitType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">Parish / Ward</label>
                    <input
                      type="text"
                      placeholder="e.g. Kimwanyi"
                      value={formParish}
                      onChange={(e) => setFormParish(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">Village / Locality</label>
                    <input
                      type="text"
                      placeholder="e.g. Nsawo Estate"
                      value={formVillage}
                      onChange={(e) => setFormVillage(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* MEDIA REQUIREMENT: STRICT 3 PHOTOS + 1 VIDEO */}
                <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">
                      Listing Media Rule (Strictly 3 Photos + 1 Video)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">Enforced</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-neutral-300 mb-1">Photo 1 (Front View) *</label>
                      <input
                        type="text"
                        required
                        value={photo1Url}
                        onChange={(e) => setPhoto1Url(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-300 mb-1">Photo 2 (Access Road) *</label>
                      <input
                        type="text"
                        required
                        value={photo2Url}
                        onChange={(e) => setPhoto2Url(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-300 mb-1">Photo 3 (Survey Beacon) *</label>
                      <input
                        type="text"
                        required
                        value={photo3Url}
                        onChange={(e) => setPhoto3Url(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">Property Video URL (MP4 / Web Video) *</label>
                    <input
                      type="text"
                      required
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">Availability</label>
                    <select
                      value={formAvailability}
                      onChange={(e) => setFormAvailability(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1">Publication Status</label>
                    <select
                      value={formPublicationStatus}
                      onChange={(e) => setFormPublicationStatus(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="unpublished">Unpublished</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                      <input
                        type="checkbox"
                        checked={formIsFeatured}
                        onChange={(e) => setFormIsFeatured(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Feature on Homepage</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSection('listings')}
                    className="px-4 py-2 text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow"
                  >
                    Save Plot Record
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ====================================================
              SECTION: SITE-VISIT REQUESTS (ALL ROLES)
              ==================================================== */}
          {activeSection === 'visits' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Customer Site-Visit Requests</h2>
                <p className="text-xs text-neutral-400">Review viewing bookings and update fulfillment status.</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                {siteVisits.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 text-neutral-400 font-semibold uppercase text-[10px] border-b border-neutral-800">
                        <tr>
                          <th className="py-3 px-3">Date Received</th>
                          <th className="py-3 px-3">Plot Reference</th>
                          <th className="py-3 px-3">Location</th>
                          <th className="py-3 px-3">Visitor Name</th>
                          <th className="py-3 px-3">Contact</th>
                          <th className="py-3 px-3">Visit Scheduled</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Direct Response</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {siteVisits.map((v) => (
                          <tr key={v.id} className="hover:bg-neutral-800/50">
                            <td className="py-3 px-3 text-neutral-400 whitespace-nowrap">
                              {new Date(v.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                              {v.listingReference}
                            </td>
                            <td className="py-3 px-3 text-neutral-300">
                              {v.districtName}, {v.subcountyName}
                            </td>
                            <td className="py-3 px-3 font-semibold text-white">{v.visitorName}</td>
                            <td className="py-3 px-3 text-neutral-300">{v.visitorPhone || '—'}</td>
                            <td className="py-3 px-3 font-medium text-blue-300 whitespace-nowrap">
                              {v.preferredDate} ({v.preferredTime})
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={v.status}
                                onChange={(e) => handleSiteVisitStatusChange(v.id, e.target.value)}
                                className="bg-neutral-950 text-[11px] font-semibold text-white rounded px-2 py-1 border border-neutral-700"
                              >
                                <option value="pending_confirmation">Pending Confirmation</option>
                                <option value="contacted">Contacted</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {v.visitorPhone && (
                                <a
                                  href={`https://wa.me/${v.visitorPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-semibold hover:bg-emerald-900"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 py-8 text-center">No site visit bookings recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* ====================================================
              SECTION: INQUIRIES & LEADS (ALL ROLES)
              ==================================================== */}
          {activeSection === 'inquiries' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Customer Inquiries & WhatsApp Logs</h2>
                <p className="text-xs text-neutral-400">Audit of initiated inquiries and customer interest.</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                {inquiries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 text-neutral-400 font-semibold uppercase text-[10px] border-b border-neutral-800">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Plot Ref</th>
                          <th className="py-3 px-4">Visitor</th>
                          <th className="py-3 px-4">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {inquiries.map((inq) => (
                          <tr key={inq.id} className="hover:bg-neutral-800/50">
                            <td className="py-3 px-4 text-neutral-400 whitespace-nowrap">
                              {new Date(inq.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-semibold text-white">
                              {inq.inquiryType.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                              {inq.listingReference || 'General'}
                            </td>
                            <td className="py-3 px-4 text-neutral-300">
                              {inq.visitorName || 'Website Visitor'}
                            </td>
                            <td className="py-3 px-4 text-neutral-400">
                              {inq.notes || 'Initiated WhatsApp contact'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 py-8 text-center">No inquiries logged yet.</p>
                )}
              </div>
            </div>
          )}

          {/* ====================================================
              SECTION: DISTRICTS & SUBCOUNTIES
              ==================================================== */}
          {activeSection === 'geography' && canManageListings && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Uganda Administrative Geography</h2>
                  <p className="text-xs text-neutral-400">Coverage across all 136 official districts and local subcounties.</p>
                </div>
                {isSuperAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDistrictModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow"
                    >
                      + Add District
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedGeoDistrictId) {
                          showFeedback('error', 'Select a district first.');
                          return;
                        }
                        setUnitModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700"
                    >
                      + Add Subcounty
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    Districts ({districts.length})
                  </span>
                  <input
                    type="text"
                    placeholder="Search district..."
                    value={geoDistrictSearch}
                    onChange={(e) => setGeoDistrictSearch(e.target.value)}
                    className="w-full text-xs bg-neutral-950 border border-neutral-700 rounded p-2 text-white"
                  />
                  <div className="max-h-96 overflow-y-auto space-y-1 divide-y divide-neutral-800">
                    {filteredDistricts.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedGeoDistrictId(d.id)}
                        className={`w-full text-left p-2.5 rounded text-xs flex items-center justify-between transition-colors ${
                          selectedGeoDistrictId === d.id
                            ? 'bg-emerald-800 text-white font-bold'
                            : 'hover:bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        <span>{d.name}</span>
                        <span className="text-[10px] text-neutral-400">{d.region}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                  {selectedGeoDistrict ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                        <div>
                          <h3 className="text-base font-bold text-white">{selectedGeoDistrict.name} District</h3>
                          <span className="text-xs text-neutral-400">Region: {selectedGeoDistrict.region} · Code: {selectedGeoDistrict.code || 'None'}</span>
                        </div>
                        {isSuperAdmin && (
                          <button
                            onClick={() => setUnitModalOpen(true)}
                            className="text-xs font-semibold text-emerald-400 hover:underline"
                          >
                            + Add Unit
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                        {selectedDistrictUnits.map((u) => (
                          <div key={u.id} className="p-2.5 bg-neutral-950 border border-neutral-800 rounded text-xs flex justify-between">
                            <span className="text-white font-medium">{u.name}</span>
                            <span className="text-neutral-400 text-[10px]">{u.unitType}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-neutral-500 text-xs">
                      Select a district from the left to view and manage its subcounties.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              SECTION: STAFF & PERMISSIONS (SUPER ADMIN ONLY)
              ==================================================== */}
          {activeSection === 'staff' && isSuperAdmin && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Staff & Permissions Management</h2>
                  <p className="text-xs text-neutral-400">
                    Control authorized operator accounts and enforce role permissions. Public self-registration is permanently disabled.
                  </p>
                </div>
                <button
                  onClick={() => setStaffModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Staff Account</span>
                </button>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 text-neutral-400 font-semibold uppercase text-[10px] border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {staffUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-neutral-800/50">
                        <td className="py-3 px-4 font-bold text-white">{user.fullName}</td>
                        <td className="py-3 px-4 text-neutral-300 font-mono text-[11px]">{user.email}</td>
                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            disabled={user.id === currentUser?.id}
                            onChange={(e) => handleChangeStaffRole(user.id, e.target.value as AdminRole)}
                            className="bg-neutral-950 text-[11px] text-white border border-neutral-700 rounded px-2 py-1 font-semibold"
                          >
                            <option value="super_admin">Super Administrator</option>
                            <option value="property_manager">Property Manager</option>
                            <option value="customer_support">Customer Support</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            user.isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleToggleStaffStatus(user.id, user.isActive)}
                              className={`text-[11px] font-semibold hover:underline ${
                                user.isActive ? 'text-red-400' : 'text-emerald-400'
                              }`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ====================================================
              SECTION: ACTIVITY & AUDIT LOGS (SUPER ADMIN ONLY)
              ==================================================== */}
          {activeSection === 'logs' && isSuperAdmin && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">System Security & Activity Audit Trail</h2>
                <p className="text-xs text-neutral-400">Timestamped operational events recorded in backend database.</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 divide-y divide-neutral-800 max-h-[500px] overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 text-xs flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-emerald-400">{log.action}</span>
                      <p className="text-neutral-300">{log.details}</p>
                    </div>
                    <div className="text-right shrink-0 text-neutral-500 font-mono text-[10px]">
                      <span className="block text-neutral-400">{log.performedBy}</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====================================================
              SECTION: ACCOUNT SETTINGS
              ==================================================== */}
          {activeSection === 'settings' && (
            <div className="max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Account Security & Credentials</h2>
                <p className="text-xs text-neutral-400">Update your operator account password.</p>
              </div>

              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-xs space-y-1">
                <span className="text-neutral-400 block">Operator Email:</span>
                <span className="font-mono text-white font-bold">{currentUser?.email}</span>
                <span className="text-neutral-400 block pt-1">Role Permission:</span>
                <span className="font-semibold text-emerald-400">{currentUser?.role}</span>
              </div>

              {pwdMsg && (
                <div className="p-2.5 bg-neutral-800 text-xs text-neutral-200 rounded">
                  {pwdMsg}
                </div>
              )}

              <form onSubmit={handleChangeOwnPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">New Password (Min 8 chars) *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow"
                >
                  Update My Password
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: CREATE STAFF ACCOUNT (SUPER ADMIN) */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Create Authorized Staff Account</h3>
            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-neutral-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Mukasa"
                  value={newStaffFullName}
                  onChange={(e) => setNewStaffFullName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. samuel@glrealestates.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Role *</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as AdminRole)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                >
                  <option value="property_manager">Property Manager</option>
                  <option value="customer_support">Customer Support</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="px-3 py-1.5 rounded text-neutral-400 hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-600"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DISTRICT */}
      {districtModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Add District</h3>
            <form onSubmit={handleCreateDistrict} className="space-y-3">
              <div>
                <label className="block text-neutral-300 mb-1">District Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mityana"
                  value={newDistrictName}
                  onChange={(e) => setNewDistrictName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Region *</label>
                <select
                  value={newDistrictRegion}
                  onChange={(e) => setNewDistrictRegion(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                >
                  <option value="Central">Central</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Northern">Northern</option>
                  <option value="Western">Western</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">District Code</label>
                <input
                  type="text"
                  placeholder="e.g. MIT"
                  value={newDistrictCode}
                  onChange={(e) => setNewDistrictCode(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDistrictModalOpen(false)}
                  className="px-3 py-1.5 rounded text-neutral-400 hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-600"
                >
                  Save District
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBCOUNTY */}
      {unitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">
              Add Administrative Unit to {selectedGeoDistrict?.name}
            </h3>
            <form onSubmit={handleCreateAdminUnit} className="space-y-3">
              <div>
                <label className="block text-neutral-300 mb-1">Administrative Unit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goma Division or Mende Subcounty"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Administrative Unit Type *</label>
                <select
                  value={newUnitType}
                  onChange={(e) => setNewUnitType(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                >
                  <option value="Subcounty">Subcounty</option>
                  <option value="Town Council">Town Council</option>
                  <option value="City Division">City Division</option>
                  <option value="Municipality Division">Municipality Division</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUnitModalOpen(false)}
                  className="px-3 py-1.5 rounded text-neutral-400 hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-600"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
