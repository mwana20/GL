import React from 'react';
import { 
  ShieldCheck, 
  Phone, 
  MessageCircle, 
  MapPin, 
  FileSearch, 
  Compass, 
  Users, 
  Scale, 
  HelpCircle,
  FileCheck2,
  CheckCircle2,
  Building
} from 'lucide-react';
import { 
  GL_PHONE_NUMBER, 
  GL_PHONE_INTERNATIONAL, 
  buildGeneralWhatsAppUrl 
} from '../utils/formatters';

interface AboutPageProps {
  onNavigate: (tab: string, extra?: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* 1. DEDICATED HERO SECTION FOR ABOUT PAGE */}
      <section className="relative min-h-[340px] sm:min-h-[400px] flex items-center justify-center bg-neutral-900 text-white overflow-hidden px-4 sm:px-6 lg:px-8 py-16">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/footer_uganda_landscape_1792431441626.jpg"
            alt="Glorious Living scenic Uganda landscape"
            className="w-full h-full object-cover object-center brightness-100 contrast-105"
          />
          {/* Reduced darkness overlay for bright, visible scenic landscape */}
          <div className="absolute inset-0 bg-neutral-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/25 to-neutral-950/35" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-neutral-950/60 backdrop-blur-sm border border-emerald-500/40 text-xs sm:text-sm font-semibold tracking-widest uppercase text-emerald-300 shadow-sm">
            Glorious Living · Uganda Real Estate
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
            About GL Real Estates
          </h1>
          <p className="text-xs sm:text-base text-neutral-100 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Connecting individuals, families, and commercial investors with genuine land opportunities across all 136 districts of Uganda with total legal transparency and verified boundaries.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-neutral-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Full Uganda Geographic Reach</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Verified Title Checks (MZO)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Guided Physical Site Inspections</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN ABOUT CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Brand Identity & Mission */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
            Our Brand Identity & Approach
          </h2>
          <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-4">
            <p>
              <strong>GL Real Estates (Glorious Living)</strong> was established to provide a modern, transparent, and nationwide digital land marketing service in Uganda.
            </p>
            <p>
              Securing land in Uganda should be clear, verifiable, and free of ambiguities. Whether you are searching for a 50-decimals residential plot in Wakiso to build your family home, commercial road frontage in Mukono or Jinja for a warehouse, or expansive agricultural acreage in Luweero, GL Real Estates bridges the gap between landowners and discerning purchasers.
            </p>
            <p>
              Unlike generic platforms that limit coverage to Kampala and immediate suburbs, GL Real Estates is engineered to support land listings from <strong>all 136 districts of Uganda</strong>, honoring the official administrative boundaries and subcounties defined by the Ministry of Local Government and the Uganda Bureau of Statistics.
            </p>
          </div>
        </div>

        {/* The 5-Step Ugandan Land Verification Process */}
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Best Practices
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
              Buyer Due Diligence Protocol in Uganda
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              We strongly advocate that every prospective land buyer complete these 5 steps prior to financial settlement:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs">1</span>
                <span>Title Search at Ministry Zonal Office (MZO)</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Conduct an official search at the relevant Ministry of Lands Zonal Office (e.g., Wakiso MZO, Mukono MZO, Kampala/KCCA, Masaka MZO). Confirm the exact registered proprietor's name, encumbrances, pending caveats, mortgages, or court orders.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs">2</span>
                <span>Cadastral Boundary Opening</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Hire a certified, registered surveyor to visit the plot with deed plans. Verify that all concrete boundary cornerstones (beacons) physically exist and match the official cadastral survey coordinates.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs">3</span>
                <span>Local Council (LC1) & Neighbors Check</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Consult the local Village Chairperson (LC1) and adjoining land neighbors. Ensure there are no disputes regarding boundaries, customary bibanja rights, family inheritance disagreements, or unrecorded sales.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs">4</span>
                <span>Formal Sale Agreement with Legal Counsel</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Have an enrolled Ugandan advocate prepare or review the formal land sale agreement. The agreement must clearly identify the seller, plot reference, agreed purchase price in UGX, witness signatories, and handover terms.
              </p>
            </div>
          </div>
        </div>

        {/* Uganda Land Tenure Systems Explained */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-neutral-900">
            Understanding Ugandan Land Tenure Systems
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            The 1995 Constitution of the Republic of Uganda recognizes four land tenure systems:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50 space-y-1">
              <span className="font-semibold text-neutral-900 block">Mailo Land (Private Mailo)</span>
              <p className="text-neutral-600">
                Predominant across Central Uganda (Buganda). Held in perpetuity with registered certificates of title. May have lawful or bona fide occupants (kibanja holders) whose rights must be honored or resolved.
              </p>
            </div>

            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50 space-y-1">
              <span className="font-semibold text-neutral-900 block">Freehold Tenure</span>
              <p className="text-neutral-600">
                Grants full ownership of land in perpetuity with a registered title deed issued under the Registration of Titles Act. Common in designated municipalities and parts of Eastern and Western Uganda.
              </p>
            </div>

            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50 space-y-1">
              <span className="font-semibold text-neutral-900 block">Leasehold Tenure</span>
              <p className="text-neutral-600">
                An agreement whereby the land owner grants another person or company the right to exclusive possession of land for a defined period (e.g., 49 or 99 years) usually subject to payment of rent or compliance with conditions.
              </p>
            </div>

            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50 space-y-1">
              <span className="font-semibold text-neutral-900 block">Customary Tenure</span>
              <p className="text-neutral-600">
                Governed by the customs and traditions of the specific community or clan. Common in Northern and parts of Eastern/Western Uganda. Can be converted into Freehold or protected through Certificates of Customary Ownership (CCO).
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-emerald-950 text-white rounded-2xl p-8 sm:p-10 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block">
              Direct Communications
            </span>
            <h2 className="text-2xl font-bold">Contact GL Real Estates</h2>
            <p className="text-xs sm:text-sm text-neutral-300">
              Reach out directly for general inquiries, plot viewings, or land listings across Uganda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-xs">
            <div className="space-y-1">
              <span className="text-neutral-400 block">Official Business Name</span>
              <span className="font-semibold text-white text-sm">GL Real Estates</span>
              <span className="text-neutral-400 block text-[11px]">(Glorious Living)</span>
            </div>

            <div className="space-y-1">
              <span className="text-neutral-400 block">WhatsApp Official</span>
              <a
                href={buildGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-400 hover:text-emerald-300 text-sm block"
              >
                +256752759996
              </a>
              <span className="text-neutral-400 block text-[11px]">Direct mobile messaging</span>
            </div>

            <div className="space-y-1">
              <span className="text-neutral-400 block">Telephone Line</span>
              <a
                href={`tel:${GL_PHONE_INTERNATIONAL}`}
                className="font-semibold text-white hover:text-neutral-200 text-sm block"
              >
                0764785491
              </a>
              <span className="text-neutral-400 block text-[11px]">Normalized Ugandan format</span>
            </div>
          </div>
        </div>

        {/* Legal Notice & Privacy Disclaimer */}
        <div className="border-t border-neutral-200 pt-8 space-y-4 text-xs text-neutral-500 leading-relaxed">
          <h3 className="font-semibold text-neutral-800 text-sm">
            Privacy Policy & Information Disclaimer
          </h3>
          <p>
            Listing information, pricing in UGX, plot measurements, photographs, and video previews displayed on GL Real Estates are provided for general marketing and initial customer evaluation. GL Real Estates does not warrant absolute completeness of third-party ownership documentation without independent verification. Prospective buyers are required to perform due diligence through accredited legal advocates and licensed surveyors.
          </p>
          <p>
            Visitor contact details submitted via our site-visit booking forms are used strictly to coordinate physical property viewings and communicate via WhatsApp or phone call. We do not sell or distribute visitor personal information to third parties.
          </p>
        </div>
      </div>
    </div>
  );
};
