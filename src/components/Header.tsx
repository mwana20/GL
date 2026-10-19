import React, { useState } from 'react';
import { Phone, MessageCircle, Menu, X, Compass, ShieldCheck, MapPin } from 'lucide-react';
import { GL_PHONE_NUMBER, GL_PHONE_INTERNATIONAL, buildGeneralWhatsAppUrl } from '../utils/formatters';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, extra?: any) => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, isAdminLoggedIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string, extra?: any) => {
    setMobileMenuOpen(false);
    onNavigate(tab, extra);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      {/* Top Bar Contract: 3 Zones (Brand, Nav links, 1 Primary Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark in display face) */}
        <button
          onClick={() => handleNav('home')}
          className="text-left group flex items-center gap-3 shrink-0 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-900 text-amber-400 font-bold flex items-center justify-center text-lg tracking-wider shadow-sm transition-transform group-hover:scale-105">
            GL
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-emerald-900 transition-colors whitespace-nowrap">
              GL Real Estates
            </span>
            <span className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase -mt-0.5">
              Glorious Living · Uganda
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop only, lg:flex) */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <button
            onClick={() => handleNav('home')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 ${
              currentTab === 'home' ? 'text-emerald-900 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('catalog')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 ${
              currentTab === 'catalog' ? 'text-emerald-900 font-semibold' : ''
            }`}
          >
            Available Land
          </button>
          <button
            onClick={() => handleNav('about')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 ${
              currentTab === 'about' ? 'text-emerald-900 font-semibold' : ''
            }`}
          >
            About GL
          </button>
          <button
            onClick={() => handleNav('guide')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 ${
              currentTab === 'guide' ? 'text-emerald-900 font-semibold' : ''
            }`}
          >
            Due Diligence Guide
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Contact (Desktop only, lg:flex) */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <a
            href={`tel:${GL_PHONE_INTERNATIONAL}`}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:text-emerald-900 transition-colors px-3 py-2 rounded-md hover:bg-neutral-100 whitespace-nowrap"
            title={`Call GL Real Estates at ${GL_PHONE_NUMBER}`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-800" />
            <span>0764785491</span>
          </a>

          <a
            href={buildGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors shadow-sm whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 text-emerald-200" />
            <span>Inquire on WhatsApp</span>
          </a>
        </div>

        {/* Mobile & Tablet Hamburger Button (lg:hidden) */}
        <div className="flex lg:hidden items-center gap-2">
          <a
            href={`tel:${GL_PHONE_INTERNATIONAL}`}
            className="p-2 text-neutral-700 hover:text-emerald-900 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-colors"
            aria-label="Call GL Real Estates"
            title="Call 0764785491"
          >
            <Phone className="w-4 h-4 text-emerald-800" />
          </a>
          {/* Hamburger Menu Button with prominent solid background color */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="px-3 py-2 text-white bg-emerald-900 hover:bg-emerald-800 border border-emerald-950 rounded-xl shadow-sm transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold text-white tracking-wide">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Slide-Over Drawer (Slides from Left to Right up to 80% width) */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sliding Drawer Container with 100% Solid Non-Transparent Background */}
      <aside
        style={{ backgroundColor: '#ffffff' }}
        className={`fixed inset-y-0 left-0 z-50 w-[80vw] max-w-[80%] bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:hidden border-r border-neutral-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation"
      >
        {/* Drawer Header */}
        <div className="bg-white">
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-100">
            <button
              onClick={() => handleNav('home')}
              className="text-left flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-900 text-amber-400 font-bold flex items-center justify-center text-base tracking-wider shadow-sm">
                GL
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-neutral-900">
                  GL Real Estates
                </span>
                <span className="text-[10px] font-medium tracking-wide text-neutral-500 uppercase -mt-0.5">
                  Uganda Land Experts
                </span>
              </div>
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/70 transition-colors focus:outline-none"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto">
            <button
              onClick={() => handleNav('home')}
              className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-left text-sm font-semibold transition-all ${
                currentTab === 'home'
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'text-neutral-800 hover:bg-neutral-100 hover:text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 shrink-0" />
                <span>Home</span>
              </div>
              {currentTab === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>

            <button
              onClick={() => handleNav('catalog')}
              className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-left text-sm font-semibold transition-all ${
                currentTab === 'catalog'
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'text-neutral-800 hover:bg-neutral-100 hover:text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Available Land</span>
              </div>
              {currentTab === 'catalog' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>

            <button
              onClick={() => handleNav('about')}
              className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-left text-sm font-semibold transition-all ${
                currentTab === 'about'
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'text-neutral-800 hover:bg-neutral-100 hover:text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-current shrink-0" />
                <span>About GL Real Estates</span>
              </div>
              {currentTab === 'about' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>

            <button
              onClick={() => handleNav('guide')}
              className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-left text-sm font-semibold transition-all ${
                currentTab === 'guide'
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'text-neutral-800 hover:bg-neutral-100 hover:text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Due Diligence Guide</span>
              </div>
              {currentTab === 'guide' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          </nav>
        </div>

        {/* Drawer Bottom Actions: WhatsApp & Phone */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/70 space-y-2.5">
          <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider px-1">
            Direct Inquiries
          </div>

          <a
            href={buildGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-white bg-emerald-800 rounded-xl hover:bg-emerald-900 shadow transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-200" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={`tel:${GL_PHONE_INTERNATIONAL}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-100 shadow-sm transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-800" />
            <span>Call: 0764785491</span>
          </a>

          <p className="text-[10px] text-center text-neutral-500 pt-1">
            Registered Ugandan Real Estate · Kampala & Wakiso
          </p>
        </div>
      </aside>
    </header>
  );
};
