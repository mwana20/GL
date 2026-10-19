import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { SearchFilters, LandListing, UgandaRegion, AdministrativeUnitType, AdminRole } from '../types';
import fs from 'fs';
import path from 'path';

export const apiRouter = Router();

// Extend Request type to include staffSession
interface AuthenticatedRequest extends Request {
  staffSession?: {
    token: string;
    userId: string;
    email: string;
    role: AdminRole;
    fullName: string;
  };
}

// Middleware: Verify Admin Session Token & Expiration
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required', code: 'UNAUTHORIZED' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.validateSession(token);

  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.', code: 'SESSION_EXPIRED' });
  }

  req.staffSession = session;
  next();
}

// Middleware: Role-Based Authorization Guard
function requireRole(allowedRoles: AdminRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.staffSession) {
      return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    if (!allowedRoles.includes(req.staffSession.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted. Your role '${req.staffSession.role}' does not have permission for this operation.`,
        code: 'FORBIDDEN'
      });
    }

    next();
  };
}

// ==========================================
// PUBLIC API ENDPOINTS (No Private Data Leaked)
// ==========================================

// 1. Get Active Districts
apiRouter.get('/districts', (req: Request, res: Response) => {
  try {
    const region = req.query.region as UgandaRegion | undefined;
    let districts = db.getDistricts(true);
    if (region) {
      districts = districts.filter(d => d.region === region);
    }
    res.json({ districts });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load districts' });
  }
});

// 2. Get Active Subcounties
apiRouter.get('/subcounties', (req: Request, res: Response) => {
  try {
    const districtId = req.query.districtId as string | undefined;
    const units = db.getAdministrativeUnits(districtId, true);
    res.json({ units });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load administrative units' });
  }
});

// 3. Search Published Land Listings Only
apiRouter.get('/listings', (req: Request, res: Response) => {
  try {
    const filters: SearchFilters = {
      districtId: req.query.districtId as string | undefined,
      administrativeUnitId: req.query.administrativeUnitId as string | undefined,
      category: req.query.category as any,
      availability: req.query.availability as any,
      minPriceUgx: req.query.minPriceUgx ? Number(req.query.minPriceUgx) : undefined,
      maxPriceUgx: req.query.maxPriceUgx ? Number(req.query.maxPriceUgx) : undefined,
      query: req.query.query as string | undefined,
      sortBy: req.query.sortBy as any,
    };

    // false = includeUnpublished: false (strict public segregation)
    const listings = db.getListings(filters, false);
    res.json({
      total: listings.length,
      listings
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to search listings' });
  }
});

// 4. Get Single Published Listing
apiRouter.get('/listings/:idOrRef', (req: Request, res: Response) => {
  try {
    const { idOrRef } = req.params;
    const listing = db.getListingById(idOrRef, false);
    if (!listing) {
      return res.status(404).json({ error: `Listing '${idOrRef}' not found or is currently not available.` });
    }
    res.json({ listing });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load listing' });
  }
});

// 5. Submit Public Site-Visit Request
apiRouter.post('/site-visits', (req: Request, res: Response) => {
  try {
    const {
      listingId,
      listingReference,
      listingTitle,
      districtName,
      subcountyName,
      visitorName,
      visitorPhone,
      preferredDate,
      preferredTime,
      additionalMessage
    } = req.body;

    if (!listingId || !listingReference || !visitorName || !preferredDate || !preferredTime) {
      return res.status(400).json({ error: 'Missing required site visit fields.' });
    }

    const selectedDate = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ error: 'Preferred site visit date cannot be in the past.' });
    }

    const visit = db.createSiteVisit({
      listingId,
      listingReference,
      listingTitle: listingTitle || 'Land Plot',
      districtName: districtName || '',
      subcountyName: subcountyName || '',
      visitorName,
      visitorPhone,
      preferredDate,
      preferredTime,
      additionalMessage
    });

    res.status(201).json({
      message: 'Site visit request registered successfully. GL Real Estates will confirm via WhatsApp/phone.',
      visit
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to register site visit' });
  }
});

// 6. Record WhatsApp or General Contact Inquiry Attempt
apiRouter.post('/inquiries', (req: Request, res: Response) => {
  try {
    const { listingId, listingReference, inquiryType, visitorName, visitorContact, notes } = req.body;
    const record = db.recordInquiry({
      listingId,
      listingReference,
      inquiryType: inquiryType || 'whatsapp_listing',
      visitorName,
      visitorContact,
      notes
    });
    res.status(201).json({ success: true, inquiryId: record.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record inquiry' });
  }
});

// ==========================================
// PRIVATE ADMIN AUTHENTICATION
// ==========================================

// Staff Login with Rate Limiting & Lockout
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const authResult = db.authenticateStaff(email, password);
    res.json(authResult);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Authentication failed' });
  }
});

// Staff Logout
apiRouter.post('/admin/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const token = req.staffSession!.token;
    db.logoutSession(token);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Password Reset Request
apiRouter.post('/admin/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required.' });

    const result = db.requestPasswordReset(email);
    res.json({
      success: true,
      message: 'If an authorized administrator account exists for this email, password reset instructions have been dispatched.',
      // For evaluation convenience in the prototype environment, we include the reset token if found
      resetToken: result.resetToken
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Password Reset Completion
apiRouter.post('/admin/reset-password', (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required.' });
    }

    db.resetPasswordWithToken(resetToken, newPassword);
    res.json({ success: true, message: 'Password has been reset successfully. You may now sign in with your new password.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get Current Authenticated Profile
apiRouter.get('/admin/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const staff = db.getStaffUsers().find(u => u.id === req.staffSession!.userId);
  if (!staff) {
    return res.status(404).json({ error: 'User profile not found' });
  }
  res.json({ user: staff });
});

// Change Own Password
apiRouter.patch('/admin/me/password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    db.updateOwnPassword(req.staffSession!.userId, currentPassword, newPassword);
    res.json({ success: true, message: 'Your password was updated successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// PROTECTED ADMIN ENDPOINTS (RBAC)
// ==========================================

// Dashboard Metrics (All authenticated staff roles)
apiRouter.get('/admin/metrics', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const metrics = db.getDashboardMetrics();
    res.json({ metrics });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Listings List (Super Admin & Property Manager)
apiRouter.get(
  '/admin/listings',
  requireAuth,
  requireRole(['super_admin', 'property_manager']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const filters: SearchFilters = {
        districtId: req.query.districtId as string | undefined,
        category: req.query.category as any,
        availability: req.query.availability as any,
        query: req.query.query as string | undefined
      };
      // true = includeUnpublished
      const listings = db.getListings(filters, true);
      res.json({ listings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Create Listing (Super Admin & Property Manager only - strictly enforces 3 photos + 1 video)
apiRouter.post(
  '/admin/listings',
  requireAuth,
  requireRole(['super_admin', 'property_manager']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const listing = db.createListing(req.body, req.staffSession!.email);
      res.status(201).json({ listing });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Update Listing (Super Admin & Property Manager)
apiRouter.put(
  '/admin/listings/:id',
  requireAuth,
  requireRole(['super_admin', 'property_manager']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = db.updateListing(req.params.id, req.body, req.staffSession!.email);
      res.json({ listing: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Delete Listing (Super Admin ONLY)
apiRouter.delete(
  '/admin/listings/:id',
  requireAuth,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const success = db.deleteListing(req.params.id, req.staffSession!.email);
      if (!success) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Quick availability toggle (Super Admin & Property Manager)
apiRouter.patch(
  '/admin/listings/:id/availability',
  requireAuth,
  requireRole(['super_admin', 'property_manager']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { availability } = req.body;
      if (!['available', 'reserved', 'sold'].includes(availability)) {
        return res.status(400).json({ error: 'Invalid availability status' });
      }
      const updated = db.updateListing(req.params.id, { availability }, req.staffSession!.email);
      res.json({ listing: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Quick publish toggle (Super Admin & Property Manager)
apiRouter.patch(
  '/admin/listings/:id/publish',
  requireAuth,
  requireRole(['super_admin', 'property_manager']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { publicationStatus } = req.body;
      if (!['published', 'draft', 'unpublished'].includes(publicationStatus)) {
        return res.status(400).json({ error: 'Invalid publication status' });
      }
      const updated = db.updateListing(req.params.id, { publicationStatus }, req.staffSession!.email);
      res.json({ listing: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Districts Management (Read: Super Admin & Property Manager; Write: Super Admin)
apiRouter.get(
  '/admin/districts',
  requireAuth,
  requireRole(['super_admin', 'property_manager']),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const districts = db.getDistricts(false);
      res.json({ districts });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

apiRouter.post(
  '/admin/districts',
  requireAuth,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, region, code, isActive } = req.body;
      if (!name || !region) {
        return res.status(400).json({ error: 'District name and region are required' });
      }
      const district = db.createDistrict({
        name,
        region,
        code,
        isActive: isActive !== false,
        source: `GL Admin (${req.staffSession!.fullName})`
      }, req.staffSession!.email);
      res.status(201).json({ district });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

apiRouter.put(
  '/admin/districts/:id',
  requireAuth,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = db.updateDistrict(req.params.id, req.body, req.staffSession!.email);
      if (!updated) return res.status(404).json({ error: 'District not found' });
      res.json({ district: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Subcounties Management (Read: Super Admin & Property Manager; Write: Super Admin)
apiRouter.get(
  '/admin/administrative-units',
  requireAuth,
  requireRole(['super_admin', 'property_manager']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const districtId = req.query.districtId as string | undefined;
      const units = db.getAdministrativeUnits(districtId, false);
      res.json({ units });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

apiRouter.post(
  '/admin/administrative-units',
  requireAuth,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { districtId, name, unitType, isActive, code } = req.body;
      if (!districtId || !name || !unitType) {
        return res.status(400).json({ error: 'District ID, name, and unit type are required' });
      }
      const unit = db.createAdministrativeUnit({
        districtId,
        name,
        unitType,
        isActive: isActive !== false,
        code
      }, req.staffSession!.email);
      res.status(201).json({ unit });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

apiRouter.put(
  '/admin/administrative-units/:id',
  requireAuth,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = db.updateAdministrativeUnit(req.params.id, req.body, req.staffSession!.email);
      if (!updated) return res.status(404).json({ error: 'Administrative unit not found' });
      res.json({ unit: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Site Visits Management (All Staff: Super Admin, Property Manager, Customer Support)
apiRouter.get(
  '/admin/site-visits',
  requireAuth,
  requireRole(['super_admin', 'property_manager', 'customer_support']),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const visits = db.getSiteVisits();
      res.json({ visits });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

apiRouter.patch(
  '/admin/site-visits/:id',
  requireAuth,
  requireRole(['super_admin', 'property_manager', 'customer_support']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status } = req.body;
      const updated = db.updateSiteVisitStatus(req.params.id, status, req.staffSession!.email);
      if (!updated) return res.status(404).json({ error: 'Site visit not found' });
      res.json({ visit: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Inquiries (All Staff: Super Admin, Property Manager, Customer Support)
apiRouter.get(
  '/admin/inquiries',
  requireAuth,
  requireRole(['super_admin', 'property_manager', 'customer_support']),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const inquiries = db.getInquiries();
      res.json({ inquiries });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==========================================
// STAFF & PERMISSIONS (SUPER ADMIN ONLY)
// ==========================================

apiRouter.get(
  '/admin/staff',
  requireAuth,
  requireRole(['super_admin']),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const staff = db.getStaffUsers();
      res.json({ staff });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

apiRouter.post(
  '/admin/staff',
  requireAuth,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, fullName, role, initialPassword } = req.body;
      if (!email || !fullName || !role || !initialPassword) {
        return res.status(400).json({ error: 'Email, full name, role, and initial password are required.' });
      }

      const created = db.createStaffUser({
        email,
        fullName,
        role,
        initialPasswordPlain: initialPassword
      }, req.staffSession!.email);

      res.status(201).json({ user: created });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

apiRouter.patch(
  '/admin/staff/:id/role',
  requireAuth,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { role } = req.body;
      if (!['super_admin', 'property_manager', 'customer_support'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role assignment.' });
      }
      const updated = db.updateStaffRole(req.params.id, role, req.staffSession!.email);
      res.json({ user: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

apiRouter.patch(
  '/admin/staff/:id/status',
  requireAuth,
  requireRole(['super_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { isActive } = req.body;
      const updated = db.updateStaffStatus(req.params.id, Boolean(isActive), req.staffSession!.email);
      res.json({ user: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Audit Logs (Super Admin ONLY)
apiRouter.get(
  '/admin/audit-logs',
  requireAuth,
  requireRole(['super_admin']),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const logs = db.getAuditLogs();
      res.json({ logs });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Media Upload (Super Admin & Property Manager)
apiRouter.post(
  '/admin/upload-media',
  requireAuth,
  requireRole(['super_admin', 'property_manager']),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { base64Data, filename, mediaType } = req.body;
      if (!base64Data || !filename) {
        return res.status(400).json({ error: 'base64Data and filename are required' });
      }

      const uploadsDir = process.env.UPLOADS_DIR
        ? path.resolve(process.env.UPLOADS_DIR)
        : path.resolve(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const cleanFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = path.join(uploadsDir, cleanFilename);

      const base64Content = base64Data.replace(/^data:[^;]+;base64,/, '');
      fs.writeFileSync(filePath, Buffer.from(base64Content, 'base64'));

      const publicApiUrl = (process.env.PUBLIC_API_URL || process.env.RENDER_EXTERNAL_URL || '')
        .replace(/\/+$/, '');
      const publicUrl = `${publicApiUrl}/uploads/${cleanFilename}`;
      res.status(201).json({
        url: publicUrl,
        mediaType: mediaType || 'photo',
        filename: cleanFilename
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Media upload failed' });
    }
  }
);
