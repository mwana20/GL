import React, { useState, useEffect } from 'react';
import { LandListing, SearchFilters } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { AboutPage } from './pages/AboutPage';
import { DueDiligenceGuidePage } from './pages/DueDiligenceGuidePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { buildWhatsAppInquiryUrl } from './utils/formatters';

export function App() {
  // Detect if current route is the private admin portal (/admin or /admin/*)
  const [isAdminPortal, setIsAdminPortal] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/admin');
    }
    return false;
  });

  const [currentTab, setCurrentTab] = useState<'home' | 'catalog' | 'detail' | 'about' | 'guide'>('home');
  const [selectedListing, setSelectedListing] = useState<LandListing | null>(null);
  const [catalogFilters, setCatalogFilters] = useState<SearchFilters>({});
  const [featuredListings, setFeaturedListings] = useState<LandListing[]>([]);
  const [recentListings, setRecentListings] = useState<LandListing[]>([]);
  const [allListings, setAllListings] = useState<LandListing[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Initial load: fetch listings & monitor popstate
  useEffect(() => {
    // Check admin session token
    api.adminGetMe()
      .then(() => setIsAdminLoggedIn(true))
      .catch(() => setIsAdminLoggedIn(false));

    // Fetch listings for public catalog and home
    api.getListings({})
      .then((res) => {
        const all = res.listings;
        setAllListings(all);
        const featured = all.filter((l) => l.isFeatured);
        setFeaturedListings(featured.length > 0 ? featured.slice(0, 3) : all.slice(0, 3));
        setRecentListings(all.slice(0, 6));

        // Check if URL has a specific plot ref, e.g. ?plot=GL-0001
        const urlParams = new URLSearchParams(window.location.search);
        const plotRef = urlParams.get('plot');
        if (plotRef && !window.location.pathname.startsWith('/admin')) {
          const match = all.find(
            (l) => l.referenceNumber.toLowerCase() === plotRef.toLowerCase() || l.id === plotRef
          );
          if (match) {
            setSelectedListing(match);
            setCurrentTab('detail');
          }
        }
      })
      .catch(console.error);

    // Synchronize browser history / popstate
    const handlePopState = () => {
      const isAdm = window.location.pathname.startsWith('/admin');
      setIsAdminPortal(isAdm);

      if (!isAdm) {
        const urlParams = new URLSearchParams(window.location.search);
        const plotRef = urlParams.get('plot');
        if (plotRef) {
          const match = allListings.find(
            (l) => l.referenceNumber.toLowerCase() === plotRef.toLowerCase() || l.id === plotRef
          );
          if (match) {
            setSelectedListing(match);
            setCurrentTab('detail');
            return;
          }
        }
        // If not plot query, determine public page from path
        const path = window.location.pathname;
        if (path === '/catalog') setCurrentTab('catalog');
        else if (path === '/about') setCurrentTab('about');
        else if (path === '/guide') setCurrentTab('guide');
        else setCurrentTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle hero search submission
  const handleHeroSearch = (filters: SearchFilters) => {
    setCatalogFilters(filters);
    setCurrentTab('catalog');
    const url = new URL(window.location.origin);
    url.pathname = '/catalog';
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle clicking on a listing
  const handleSelectListing = (listing: LandListing) => {
    setSelectedListing(listing);
    setCurrentTab('detail');
    setIsAdminPortal(false);
    // Update URL query parameter without full reload for shareability
    const url = new URL(window.location.origin);
    url.searchParams.set('plot', listing.referenceNumber);
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to catalog from detail page
  const handleBackToCatalog = () => {
    setCurrentTab('catalog');
    const url = new URL(window.location.origin);
    url.pathname = '/catalog';
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle public navigation
  const handleNavigate = (tab: string, extra?: any) => {
    if (tab === 'admin') {
      setIsAdminPortal(true);
      window.history.pushState({}, '', '/admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsAdminPortal(false);
    const url = new URL(window.location.origin);

    if (tab === 'catalog') {
      if (extra) {
        setCatalogFilters(extra);
      }
      setCurrentTab('catalog');
      url.pathname = '/catalog';
    } else if (tab === 'about') {
      setCurrentTab('about');
      url.pathname = '/about';
    } else if (tab === 'guide') {
      setCurrentTab('guide');
      url.pathname = '/guide';
    } else {
      setCurrentTab('home');
      url.pathname = '/';
    }

    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle direct WhatsApp inquiry from a listing card
  const handleInquireWhatsApp = (listing: LandListing) => {
    api.recordInquiry({
      listingId: listing.id,
      listingReference: listing.referenceNumber,
      inquiryType: 'whatsapp_listing',
    }).catch(console.error);

    const url = buildWhatsAppInquiryUrl(listing);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // =========================================================================
  // 1. SEPARATE PRIVATE ADMIN PORTAL (https://your-domain.com/admin)
  // Distinct layout, no public header, no public footer, no public widgets.
  // =========================================================================
  if (isAdminPortal) {
    return (
      <AdminDashboard
        initialSubpath={typeof window !== 'undefined' ? window.location.pathname : '/admin'}
        onViewPublicListing={handleSelectListing}
        onGoToPublicSite={() => {
          setIsAdminPortal(false);
          window.history.pushState({}, '', '/');
        }}
        onLogout={() => {
          setIsAdminLoggedIn(false);
        }}
      />
    );
  }

  // =========================================================================
  // 2. SEPARATE PUBLIC WEBSITE (https://your-domain.com/)
  // Customer-facing design, verified land plots, WhatsApp contact, public info.
  // No admin controls or links visible anywhere to visitors.
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-neutral-900">
      {/* Universal Top Navigation Header (No admin link in public view) */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content View - Every public page has a dedicated hero */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            featuredListings={featuredListings}
            recentListings={recentListings}
            onSelectListing={handleSelectListing}
            onSearch={handleHeroSearch}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'catalog' && (
          <CatalogPage
            initialFilters={catalogFilters}
            onSelectListing={handleSelectListing}
            onInquireWhatsApp={handleInquireWhatsApp}
          />
        )}

        {currentTab === 'detail' && selectedListing && (
          <ListingDetailPage
            listing={selectedListing}
            onBack={handleBackToCatalog}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'guide' && (
          <DueDiligenceGuidePage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Persistent Floating WhatsApp Action Button */}
      <WhatsAppButton />

      {/* Compliant Footer with background image & land disclaimers */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
