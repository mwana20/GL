import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Compass, 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  FileCheck2, 
  Layers, 
  CheckCircle2, 
  Users 
} from 'lucide-react';
import { LandListing } from '../types';
import { HeroSearch } from '../components/HeroSearch';
import { ListingCard } from '../components/ListingCard';
import { GL_PHONE_NUMBER, GL_PHONE_INTERNATIONAL, buildGeneralWhatsAppUrl } from '../utils/formatters';

interface HomePageProps {
  featuredListings: LandListing[];
  recentListings: LandListing[];
  onSelectListing: (listing: LandListing) => void;
  onSearch: (filters: any) => void;
  onNavigate: (tab: string, extra?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  featuredListings,
  recentListings,
  onSelectListing,
  onSearch,
  onNavigate,
}) => {
  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center justify-center bg-neutral-900 text-white overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Background Image with Reduced Darkness */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero_uganda_landscape_1792429858568.jpg"
            alt="Scenic rolling hills and surveyed land in Uganda"
            className="w-full h-full object-cover object-center brightness-100 contrast-105"
          />
          {/* Reduced darkness overlay for bright, visible Ugandan scenery */}
          <div className="absolute inset-0 bg-neutral-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/25 to-neutral-950/35" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto w-full text-center space-y-6 sm:space-y-8">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-neutral-950/60 backdrop-blur-sm border border-emerald-500/40 text-xs sm:text-sm font-semibold tracking-widest uppercase text-emerald-300 shadow-sm">
              GL Real Estates · Glorious Living
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight drop-shadow-md" style={{ textWrap: 'balance' }}>
              Find Land. Build Your Future.
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-100 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-sm">
              Explore verified land and plots for sale across all 136 districts of Uganda. Search by district, subcounty, and budget, then contact GL Real Estates to arrange an on-site viewing.
            </p>
          </div>

          {/* Connected Hero Search Panel */}
          <div className="pt-2 text-left">
            <HeroSearch onSearch={onSearch} />
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>136 Ugandan Districts Supported</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>3 Photos + 1 Video Per Listing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Direct WhatsApp Inquiries</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEMO CONTENT NOTICE (As required by prompt) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-900">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">
                Official GL Real Estates Demonstration Database
              </p>
              <p className="text-amber-800 mt-0.5">
                The listings presented below represent verified demonstration land records configured for system review until approved or supplemented by GL Real Estates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED LAND LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Curated Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
              Featured Plots in Uganda
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Surveyed residential plots, highway commercial land, and fertile farm acreage.
            </p>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-900 hover:text-emerald-700 transition-colors self-start sm:self-auto group"
          >
            <span>View All Available Land</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSelect={onSelectListing}
            />
          ))}
        </div>
      </section>

      {/* 4. DISCOVER LAND BY REGION & DISTRICT */}
      <section className="bg-neutral-100/70 border-y border-neutral-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Countrywide Coverage
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
              Discover Land by Ugandan Region
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              GL Real Estates operates across all regions of Uganda, connecting buyers with vetted plots.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Central */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm space-y-4 hover:border-emerald-800 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-lg">Central Region</h3>
                <span className="text-xs text-neutral-500">24 Districts</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Prime residential suburbs, estate developments, and lakefront land in Wakiso, Mukono, Kampala, Mpigi, Luweero, and Masaka.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-neutral-700">
                <button
                  onClick={() => onSearch({ districtId: 'dist_wakiso' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Wakiso
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => onSearch({ districtId: 'dist_mukono' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Mukono
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => onSearch({ districtId: 'dist_kampala' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Kampala
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => onSearch({ districtId: 'dist_luweero' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Luweero
                </button>
              </div>
            </div>

            {/* Eastern */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm space-y-4 hover:border-emerald-800 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-lg">Eastern Region</h3>
                <span className="text-xs text-neutral-500">32 Districts</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Thriving commercial hubs, tourism acreage near the River Nile, and agricultural soils in Jinja, Mbale, Iganga, and Tororo.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-neutral-700">
                <button
                  onClick={() => onSearch({ districtId: 'dist_jinja' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Jinja
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => onSearch({ districtId: 'dist_mbale' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Mbale
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => onSearch({ districtId: 'dist_soroti' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Soroti
                </button>
              </div>
            </div>

            {/* Western */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm space-y-4 hover:border-emerald-800 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-lg">Western Region</h3>
                <span className="text-xs text-neutral-500">35 Districts</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Ranch lands, tourism plots in Fort Portal / Kabarole, oil-corridor real estate in Hoima, and urban plots in Mbarara City.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-neutral-700">
                <button
                  onClick={() => onSearch({ districtId: 'dist_mbarara' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Mbarara
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => onSearch({ districtId: 'dist_kabarole' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Kabarole
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => onSearch({ districtId: 'dist_hoima' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Hoima
                </button>
              </div>
            </div>

            {/* Northern */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm space-y-4 hover:border-emerald-800 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-lg">Northern Region</h3>
                <span className="text-xs text-neutral-500">45 Districts</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Large agricultural holdings, commercial plots in regional cities like Gulu, Arua, and Lira, and developing trade routes.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-neutral-700">
                <button
                  onClick={() => onSearch({ districtId: 'dist_gulu' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Gulu
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => onSearch({ districtId: 'dist_arua' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Arua
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => onSearch({ districtId: 'dist_lira' })}
                  className="hover:text-emerald-900 hover:underline"
                >
                  Lira
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DUE DILIGENCE PILLARS (Buyer Confidence & Trust) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block">
              Land Acquisition Protocol
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Transparent, Step-by-Step Land Acquisition in Uganda
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Buying land is a critical life investment. GL Real Estates guides you through standard due diligence to guarantee peace of mind.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>1. Official Ministry Search</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Verify title deeds at the relevant Ministry of Lands Zonal Office (MZO) to confirm registered ownership and ensure zero caveats.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>2. Boundary Verification</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Open and confirm corner beacons with a certified surveyor to guarantee the plot dimensions match deed cadastral prints.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>3. Local Council (LC1) Consent</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Engage area leadership and adjoining neighbors to confirm genuine occupation rights and absence of family disputes.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>4. On-Site Inspection Tours</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Schedule physical visits to review road access, terrain elevation, drainage, and utility networks before financial commitment.
                </p>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('guide')}
                className="px-5 py-2.5 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Read Full Verification Guide
              </button>

              <a
                href={buildGeneralWhatsAppUrl('Site Visit & Land Due Diligence Inquiry')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Talk with Our Land Advisors</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-100 rounded-2xl p-8 sm:p-10 border border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Have a Specific Location in Mind?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              Reach out directly to GL Real Estates. Our field team can locate surveyed plots matching your budget anywhere in Uganda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={`tel:${GL_PHONE_INTERNATIONAL}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-neutral-900 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-800" />
              <span>Call: 0764785491</span>
            </a>

            <a
              href={buildGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp +256752759996</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
