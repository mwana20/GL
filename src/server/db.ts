import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  District, 
  AdministrativeUnit, 
  LandListing, 
  SiteVisitRequest, 
  InquiryRecord, 
  AuditLog, 
  SearchFilters,
  AdminRole,
  AdminUser
} from '../types';
import { INITIAL_DISTRICTS, INITIAL_ADMIN_UNITS } from '../data/ugandaGeography';
import { INITIAL_LISTINGS } from '../data/seedListings';

export interface StoredStaffUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: AdminRole;
  passwordHash: string;
  salt: string;
  isActive: boolean;
  failedAttempts: number;
  lockedUntil: number | null;
  resetToken?: string;
  resetTokenExpires?: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface StaffSession {
  token: string;
  userId: string;
  email: string;
  role: AdminRole;
  fullName: string;
  createdAt: number;
  expiresAt: number; // 24 hours expiry
}

interface DatabaseSchema {
  districts: District[];
  administrativeUnits: AdministrativeUnit[];
  listings: LandListing[];
  siteVisits: SiteVisitRequest[];
  inquiries: InquiryRecord[];
  auditLogs: AuditLog[];
  staffUsers: StoredStaffUser[];
  sessions: StaffSession[];
  nextListingNumber: number;
}

const DB_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'gl_real_estates_db.json');

// Helper to hash password with salt
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Generate secure initial seed users
function createInitialStaffUsers(): StoredStaffUser[] {
  const salt1 = crypto.randomBytes(16).toString('hex');
  const salt2 = crypto.randomBytes(16).toString('hex');
  const salt3 = crypto.randomBytes(16).toString('hex');

  return [
    {
      id: 'staff_superadmin_01',
      email: 'superadmin@glrealestates.com',
      username: 'superadmin',
      fullName: 'Sarah Namubiru',
      role: 'super_admin',
      passwordHash: hashPassword('GloriousSuperAdmin2026!', salt1),
      salt: salt1,
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: '2026-01-10T08:00:00Z'
    },
    {
      id: 'staff_manager_02',
      email: 'propertymanager@glrealestates.com',
      username: 'propertymanager',
      fullName: 'David Kato',
      role: 'property_manager',
      passwordHash: hashPassword('GloriousManager2026!', salt2),
      salt: salt2,
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: '2026-01-15T09:00:00Z'
    },
    {
      id: 'staff_support_03',
      email: 'support@glrealestates.com',
      username: 'support',
      fullName: 'Esther Akello',
      role: 'customer_support',
      passwordHash: hashPassword('GloriousSupport2026!', salt3),
      salt: salt3,
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: '2026-01-20T10:00:00Z'
    }
  ];
}

class DatabaseService {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = {
      districts: INITIAL_DISTRICTS,
      administrativeUnits: INITIAL_ADMIN_UNITS,
      listings: INITIAL_LISTINGS,
      siteVisits: [],
      inquiries: [],
      auditLogs: [
        {
          id: 'log_seed',
          action: 'SYSTEM_INITIALIZED',
          performedBy: 'System',
          details: 'Uganda administrative geography, demonstration listings, and RBAC initialized',
          timestamp: new Date().toISOString()
        }
      ],
      staffUsers: createInitialStaffUsers(),
      sessions: [],
      nextListingNumber: 7
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const listings: LandListing[] = parsed.listings || INITIAL_LISTINGS;
        const hasLegacyImageUrls = listings.some((listing) =>
          listing.media.some((media) => media.url.startsWith('/src/assets/images/'))
        );
        const normalizedListings = listings.map((listing) => ({
          ...listing,
          media: listing.media.map((media) => ({
            ...media,
            url: media.url.replace(/^\/src\/assets\/images\//, '/images/')
          }))
        }));
        this.data = {
          districts: parsed.districts || INITIAL_DISTRICTS,
          administrativeUnits: parsed.administrativeUnits || INITIAL_ADMIN_UNITS,
          listings: normalizedListings,
          siteVisits: parsed.siteVisits || [],
          inquiries: parsed.inquiries || [],
          auditLogs: parsed.auditLogs || [],
          staffUsers: (parsed.staffUsers && parsed.staffUsers.length > 0) ? parsed.staffUsers : createInitialStaffUsers(),
          sessions: parsed.sessions || [],
          nextListingNumber: parsed.nextListingNumber || (parsed.listings ? parsed.listings.length + 1 : 7)
        };
        if (hasLegacyImageUrls) this.persistSync();
      } else {
        this.persistSync();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('Error initializing database:', err);
      this.isLoaded = true;
    }
  }

  private persistSync() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // --- Audit Logging ---
  public logAction(action: string, performedBy: string, details: string) {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.persistSync();
    return log;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // --- Staff Authentication & Sessions ---
  public authenticateStaff(emailOrUsername: string, passwordPlain: string): { user: AdminUser; token: string } {
    const term = emailOrUsername.toLowerCase().trim();
    const user = this.data.staffUsers.find(
      u => u.email.toLowerCase() === term || u.username.toLowerCase() === term
    );

    if (!user) {
      this.logAction('LOGIN_FAILED', 'Anonymous', `Failed login attempt for nonexistent user: ${term}`);
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      this.logAction('LOGIN_BLOCKED', user.email, `Deactivated account attempted login: ${user.email}`);
      throw new Error('This administrator account has been deactivated. Contact your Super Administrator.');
    }

    // Rate Limiting / Lockout Check
    const now = Date.now();
    if (user.lockedUntil && user.lockedUntil > now) {
      const remainingMinutes = Math.ceil((user.lockedUntil - now) / 60000);
      throw new Error(`Account temporarily locked due to repeated failed login attempts. Try again in ${remainingMinutes} minute(s).`);
    }

    const testHash = hashPassword(passwordPlain, user.salt);
    if (testHash !== user.passwordHash) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      if (user.failedAttempts >= 5) {
        user.lockedUntil = now + 15 * 60 * 1000; // 15 minutes lockout
        this.logAction('ACCOUNT_LOCKED', user.email, `Account locked for 15 minutes after 5 consecutive failed login attempts.`);
        this.persistSync();
        throw new Error('Too many failed login attempts. Account temporarily locked for 15 minutes.');
      }
      this.persistSync();
      const remainingAttempts = 5 - user.failedAttempts;
      throw new Error(`Invalid email or password. (${remainingAttempts} attempt(s) remaining before temporary lockout)`);
    }

    // Successful Login: reset failed attempts & update lastLogin
    user.failedAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date().toISOString();

    // Create session with 24 hours expiry
    const token = `gl_auth_${crypto.randomBytes(32).toString('hex')}`;
    const session: StaffSession = {
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000 // 24 hours
    };

    // Clean up expired sessions
    this.data.sessions = this.data.sessions.filter(s => s.expiresAt > now);
    this.data.sessions.push(session);

    this.logAction('LOGIN_SUCCESS', user.email, `User ${user.fullName} (${user.role}) logged in successfully.`);
    this.persistSync();

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      token
    };
  }

  public validateSession(token: string): StaffSession | null {
    if (!token) return null;
    const now = Date.now();
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return null;

    if (session.expiresAt <= now) {
      // Expired: prune it
      this.data.sessions = this.data.sessions.filter(s => s.token !== token);
      this.persistSync();
      return null;
    }

    // Also check if the underlying user is active
    const user = this.data.staffUsers.find(u => u.id === session.userId);
    if (!user || !user.isActive) {
      this.data.sessions = this.data.sessions.filter(s => s.token !== token);
      this.persistSync();
      return null;
    }

    return session;
  }

  public logoutSession(token: string) {
    const session = this.data.sessions.find(s => s.token === token);
    if (session) {
      this.logAction('LOGOUT', session.email, `User ${session.fullName} signed out.`);
      this.data.sessions = this.data.sessions.filter(s => s.token !== token);
      this.persistSync();
    }
  }

  // --- Password Reset ---
  public requestPasswordReset(email: string): { success: boolean; resetToken?: string } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.data.staffUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user || !user.isActive) {
      // Generic message to avoid email enumeration
      return { success: true };
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    this.logAction('PASSWORD_RESET_REQUESTED', user.email, `Password reset token generated for ${user.email}`);
    this.persistSync();
    return { success: true, resetToken };
  }

  public resetPasswordWithToken(token: string, newPasswordPlain: string): boolean {
    const now = Date.now();
    const user = this.data.staffUsers.find(
      u => u.resetToken === token && u.resetTokenExpires && u.resetTokenExpires > now
    );

    if (!user) {
      throw new Error('Invalid or expired password reset token.');
    }

    if (newPasswordPlain.length < 8) {
      throw new Error('Password must be at least 8 characters in length.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    user.passwordHash = hashPassword(newPasswordPlain, salt);
    user.salt = salt;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    user.failedAttempts = 0;
    user.lockedUntil = null;

    // Invalidate existing sessions for this user
    this.data.sessions = this.data.sessions.filter(s => s.userId !== user.id);

    this.logAction('PASSWORD_RESET_COMPLETED', user.email, `Password successfully changed via reset token for ${user.email}`);
    this.persistSync();
    return true;
  }

  // --- Staff Management (Super Admin Only) ---
  public getStaffUsers(): AdminUser[] {
    return this.data.staffUsers.map(u => ({
      id: u.id,
      email: u.email,
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt
    }));
  }

  public createStaffUser(
    userData: { email: string; fullName: string; role: AdminRole; initialPasswordPlain: string },
    performedBy: string
  ): AdminUser {
    const cleanEmail = userData.email.toLowerCase().trim();
    if (this.data.staffUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`A staff user with email ${userData.email} already exists.`);
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const newUser: StoredStaffUser = {
      id: `staff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      fullName: userData.fullName.trim(),
      role: userData.role,
      passwordHash: hashPassword(userData.initialPasswordPlain, salt),
      salt,
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: new Date().toISOString()
    };

    this.data.staffUsers.push(newUser);
    this.logAction('CREATE_STAFF_USER', performedBy, `Created staff account for ${newUser.fullName} (${newUser.email}) with role: ${newUser.role}`);
    this.persistSync();

    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };
  }

  public updateStaffRole(userId: string, newRole: AdminRole, performedBy: string): AdminUser {
    const user = this.data.staffUsers.find(u => u.id === userId);
    if (!user) throw new Error('Staff user not found.');

    const oldRole = user.role;
    user.role = newRole;

    // Update active sessions for this user
    this.data.sessions.forEach(s => {
      if (s.userId === userId) s.role = newRole;
    });

    this.logAction('UPDATE_STAFF_ROLE', performedBy, `Changed role of ${user.email} from ${oldRole} to ${newRole}`);
    this.persistSync();

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    };
  }

  public updateStaffStatus(userId: string, isActive: boolean, performedBy: string): AdminUser {
    const user = this.data.staffUsers.find(u => u.id === userId);
    if (!user) throw new Error('Staff user not found.');

    user.isActive = isActive;
    if (!isActive) {
      // Invalidate active sessions immediately
      this.data.sessions = this.data.sessions.filter(s => s.userId !== userId);
    }

    this.logAction('UPDATE_STAFF_STATUS', performedBy, `Set active status of ${user.email} to ${isActive}`);
    this.persistSync();

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    };
  }

  public updateOwnPassword(userId: string, currentPasswordPlain: string, newPasswordPlain: string): boolean {
    const user = this.data.staffUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    const currentHash = hashPassword(currentPasswordPlain, user.salt);
    if (currentHash !== user.passwordHash) {
      throw new Error('Current password does not match.');
    }

    if (newPasswordPlain.length < 8) {
      throw new Error('New password must be at least 8 characters.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    user.passwordHash = hashPassword(newPasswordPlain, salt);
    user.salt = salt;
    this.logAction('PASSWORD_CHANGED', user.email, `User ${user.email} updated their account password.`);
    this.persistSync();
    return true;
  }

  // --- Districts ---
  public getDistricts(onlyActive = true): District[] {
    if (onlyActive) {
      return this.data.districts.filter(d => d.isActive);
    }
    return this.data.districts;
  }

  public getDistrictById(id: string): District | undefined {
    return this.data.districts.find(d => d.id === id);
  }

  public createDistrict(district: Omit<District, 'id' | 'lastVerifiedDate'>, user: string): District {
    const id = `dist_${district.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const newDistrict: District = {
      ...district,
      id,
      lastVerifiedDate: new Date().toISOString().split('T')[0]
    };
    this.data.districts.push(newDistrict);
    this.logAction('CREATE_DISTRICT', user, `Added district: ${newDistrict.name} (${newDistrict.region})`);
    this.persistSync();
    return newDistrict;
  }

  public updateDistrict(id: string, updates: Partial<District>, user: string): District | null {
    const idx = this.data.districts.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.data.districts[idx] = {
      ...this.data.districts[idx],
      ...updates,
      lastVerifiedDate: new Date().toISOString().split('T')[0]
    };
    this.logAction('UPDATE_DISTRICT', user, `Updated district ${this.data.districts[idx].name}`);
    this.persistSync();
    return this.data.districts[idx];
  }

  // --- Administrative Units ---
  public getAdministrativeUnits(districtId?: string, onlyActive = true): AdministrativeUnit[] {
    let units = this.data.administrativeUnits;
    if (districtId) {
      units = units.filter(u => u.districtId === districtId);
    }
    if (onlyActive) {
      units = units.filter(u => u.isActive);
    }
    return units;
  }

  public getAdministrativeUnitById(id: string): AdministrativeUnit | undefined {
    return this.data.administrativeUnits.find(u => u.id === id);
  }

  public createAdministrativeUnit(unit: Omit<AdministrativeUnit, 'id'>, user: string): AdministrativeUnit {
    const district = this.getDistrictById(unit.districtId);
    if (!district) {
      throw new Error(`District with id ${unit.districtId} does not exist`);
    }

    const id = `unit_${unit.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const newUnit: AdministrativeUnit = {
      ...unit,
      id
    };
    this.data.administrativeUnits.push(newUnit);
    this.logAction('CREATE_ADMIN_UNIT', user, `Added ${unit.unitType} '${unit.name}' to district ${district.name}`);
    this.persistSync();
    return newUnit;
  }

  public updateAdministrativeUnit(id: string, updates: Partial<AdministrativeUnit>, user: string): AdministrativeUnit | null {
    const idx = this.data.administrativeUnits.findIndex(u => u.id === id);
    if (idx === -1) return null;

    if (updates.districtId && updates.districtId !== this.data.administrativeUnits[idx].districtId) {
      const dist = this.getDistrictById(updates.districtId);
      if (!dist) throw new Error('Target district does not exist');
    }

    this.data.administrativeUnits[idx] = {
      ...this.data.administrativeUnits[idx],
      ...updates
    };
    this.logAction('UPDATE_ADMIN_UNIT', user, `Updated administrative unit ${this.data.administrativeUnits[idx].name}`);
    this.persistSync();
    return this.data.administrativeUnits[idx];
  }

  // --- Land Listings ---
  public getListings(filters: SearchFilters = {}, includeUnpublished = false): LandListing[] {
    let result = [...this.data.listings];

    // Public users see ONLY published listings
    if (!includeUnpublished) {
      result = result.filter(l => l.publicationStatus === 'published');
    }

    if (filters.districtId) {
      result = result.filter(l => l.districtId === filters.districtId);
    }

    if (filters.administrativeUnitId) {
      result = result.filter(l => l.administrativeUnitId === filters.administrativeUnitId);
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter(l => l.category === filters.category);
    }

    if (filters.availability && filters.availability !== 'all') {
      result = result.filter(l => l.availability === filters.availability);
    }

    if (filters.minPriceUgx !== undefined && filters.minPriceUgx > 0) {
      result = result.filter(l => l.priceUgx >= filters.minPriceUgx!);
    }

    if (filters.maxPriceUgx !== undefined && filters.maxPriceUgx > 0) {
      result = result.filter(l => l.priceUgx <= filters.maxPriceUgx!);
    }

    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(l => 
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.referenceNumber.toLowerCase().includes(q) ||
        l.districtName.toLowerCase().includes(q) ||
        l.administrativeUnitName.toLowerCase().includes(q) ||
        (l.parishOrWard && l.parishOrWard.toLowerCase().includes(q)) ||
        (l.villageOrLocality && l.villageOrLocality.toLowerCase().includes(q))
      );
    }

    if (filters.sortBy === 'price_asc') {
      result.sort((a, b) => a.priceUgx - b.priceUgx);
    } else if (filters.sortBy === 'price_desc') {
      result.sort((a, b) => b.priceUgx - a.priceUgx);
    } else if (filters.sortBy === 'size_desc') {
      result.sort((a, b) => b.landSize - a.landSize);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }

  public getListingById(idOrRef: string, includeUnpublished = false): LandListing | undefined {
    const listing = this.data.listings.find(
      l => l.id === idOrRef || l.referenceNumber.toLowerCase() === idOrRef.toLowerCase()
    );
    if (!listing) return undefined;
    if (!includeUnpublished && listing.publicationStatus !== 'published') {
      return undefined;
    }
    return listing;
  }

  public generateReferenceNumber(): string {
    const num = this.data.nextListingNumber;
    this.data.nextListingNumber += 1;
    this.persistSync();
    return `GL-${String(num).padStart(4, '0')}`;
  }

  public createListing(listingData: Omit<LandListing, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt'>, user: string): LandListing {
    const district = this.getDistrictById(listingData.districtId);
    if (!district) {
      throw new Error(`Invalid district ID: ${listingData.districtId}`);
    }

    const adminUnit = this.getAdministrativeUnitById(listingData.administrativeUnitId);
    if (!adminUnit) {
      throw new Error(`Invalid administrative unit ID: ${listingData.administrativeUnitId}`);
    }

    if (adminUnit.districtId !== district.id) {
      throw new Error(`Administrative unit ${adminUnit.name} does not belong to district ${district.name}`);
    }

    // Strict 3 photos and 1 video rule
    if (listingData.publicationStatus === 'published') {
      this.validateMediaRequirements(listingData.media);
    }

    const ref = this.generateReferenceNumber();
    const id = `plot_${ref.toLowerCase().replace('-', '_')}_${Date.now()}`;
    const now = new Date().toISOString();

    const newListing: LandListing = {
      ...listingData,
      id,
      referenceNumber: ref,
      districtName: district.name,
      administrativeUnitName: adminUnit.name,
      createdAt: now,
      updatedAt: now
    };

    this.data.listings.unshift(newListing);
    this.logAction('CREATE_LISTING', user, `Created listing ${ref}: "${newListing.title}" in ${district.name}, ${adminUnit.name}`);
    this.persistSync();
    return newListing;
  }

  public updateListing(id: string, updates: Partial<LandListing>, user: string): LandListing {
    const idx = this.data.listings.findIndex(l => l.id === id);
    if (idx === -1) {
      throw new Error(`Listing not found with id ${id}`);
    }

    const current = this.data.listings[idx];
    const targetDistrictId = updates.districtId || current.districtId;
    const targetAdminUnitId = updates.administrativeUnitId || current.administrativeUnitId;

    const district = this.getDistrictById(targetDistrictId);
    if (!district) throw new Error('Invalid district ID');

    const adminUnit = this.getAdministrativeUnitById(targetAdminUnitId);
    if (!adminUnit) throw new Error('Invalid administrative unit ID');

    if (adminUnit.districtId !== district.id) {
      throw new Error(`Administrative unit ${adminUnit.name} does not belong to district ${district.name}`);
    }

    const updatedMedia = updates.media || current.media;
    const updatedPubStatus = updates.publicationStatus || current.publicationStatus;

    if (updatedPubStatus === 'published') {
      this.validateMediaRequirements(updatedMedia);
    }

    const updatedListing: LandListing = {
      ...current,
      ...updates,
      districtName: district.name,
      administrativeUnitName: adminUnit.name,
      updatedAt: new Date().toISOString()
    };

    this.data.listings[idx] = updatedListing;
    this.logAction('UPDATE_LISTING', user, `Updated listing ${current.referenceNumber}`);
    this.persistSync();
    return updatedListing;
  }

  public deleteListing(id: string, user: string): boolean {
    const idx = this.data.listings.findIndex(l => l.id === id);
    if (idx === -1) return false;
    const ref = this.data.listings[idx].referenceNumber;
    this.data.listings.splice(idx, 1);
    this.logAction('DELETE_LISTING', user, `Deleted listing ${ref}`);
    this.persistSync();
    return true;
  }

  private validateMediaRequirements(media: LandListing['media']) {
    const photos = media.filter(m => m.mediaType === 'photo' && m.url && m.url.trim().length > 0);
    const videos = media.filter(m => m.mediaType === 'video' && m.url && m.url.trim().length > 0);

    if (photos.length !== 3) {
      throw new Error(`Listing must have exactly 3 photos to be published (currently has ${photos.length}).`);
    }

    if (videos.length !== 1) {
      throw new Error(`Listing must have exactly 1 video to be published (currently has ${videos.length}).`);
    }
  }

  // --- Site Visits ---
  public createSiteVisit(req: Omit<SiteVisitRequest, 'id' | 'createdAt' | 'status'>): SiteVisitRequest {
    const id = `visit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newVisit: SiteVisitRequest = {
      ...req,
      id,
      status: 'pending_confirmation',
      createdAt: new Date().toISOString()
    };
    this.data.siteVisits.unshift(newVisit);
    this.persistSync();
    return newVisit;
  }

  public getSiteVisits(): SiteVisitRequest[] {
    return this.data.siteVisits;
  }

  public updateSiteVisitStatus(id: string, status: SiteVisitRequest['status'], user: string): SiteVisitRequest | null {
    const visit = this.data.siteVisits.find(v => v.id === id);
    if (!visit) return null;
    visit.status = status;
    this.logAction('UPDATE_SITE_VISIT', user, `Marked visit for ${visit.listingReference} as ${status}`);
    this.persistSync();
    return visit;
  }

  // --- Inquiries ---
  public recordInquiry(inquiry: Omit<InquiryRecord, 'id' | 'createdAt'>): InquiryRecord {
    const id = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newInquiry: InquiryRecord = {
      ...inquiry,
      id,
      createdAt: new Date().toISOString()
    };
    this.data.inquiries.unshift(newInquiry);
    this.persistSync();
    return newInquiry;
  }

  public getInquiries(): InquiryRecord[] {
    return this.data.inquiries;
  }

  // --- Dashboard Metrics ---
  public getDashboardMetrics() {
    const all = this.data.listings;
    const published = all.filter(l => l.publicationStatus === 'published');
    const available = published.filter(l => l.availability === 'available');
    const reserved = published.filter(l => l.availability === 'reserved');
    const sold = published.filter(l => l.availability === 'sold');
    const unpublished = all.filter(l => l.publicationStatus !== 'published');

    return {
      totalListings: all.length,
      publishedListings: published.length,
      availableListings: available.length,
      reservedListings: reserved.length,
      soldListings: sold.length,
      unpublishedListings: unpublished.length,
      totalSiteVisits: this.data.siteVisits.length,
      pendingSiteVisits: this.data.siteVisits.filter(v => v.status === 'pending_confirmation').length,
      totalInquiries: this.data.inquiries.length,
      totalDistricts: this.data.districts.length,
      totalAdministrativeUnits: this.data.administrativeUnits.length,
      totalStaff: this.data.staffUsers.length
    };
  }
}

export const db = new DatabaseService();
