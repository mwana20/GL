import React from 'react';
import { Phone, MessageCircle, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { GL_PHONE_NUMBER, GL_PHONE_INTERNATIONAL, buildGeneralWhatsAppUrl } from '../utils/formatters';

interface FooterProps {
  onNavigate: (tab: string, extra?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative bg-neutral-950 text-neutral-300 border-t border-neutral-800 overflow-hidden">
      {/* Background Image with Scrim for Perfect Contrast & Legibility */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/footer_uganda_landscape_1792431441626.jpg"
          alt="Tranquil Ugandan landscape at dusk"
          className="w-full h-full object-cover object-center opacity-40 brightness-90 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800/80">
          {/* Brand and Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700/90 text-amber-300 font-bold flex items-center justify-center text-lg shadow-md border border-emerald-600/40">
                GL
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block">
                  GL Real Estates
                </span>
                <span className="text-[11px] font-medium tracking-wide text-neutral-400 uppercase">
                  Glorious Living · Uganda
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-neutral-300">
              <strong className="text-neutral-100">Glorious Living</strong> is a dedicated Ugandan real estate enterprise specializing in marketing surveyed land and plots across all 136 districts of Uganda.
            </p>
            <div className="pt-2 text-xs text-neutral-400 space-y-1">
              <p>Registered Operations in Uganda</p>
              <p>Land Marketing & Site Facilitation</p>
            </div>
          </div>

          {/* Direct Contact Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-neutral-100">
              Official Contact
            </h4>
            <div className="space-y-3 text-xs">
              <a
                href={buildGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-emerald-400 transition-colors group"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block font-medium text-white">WhatsApp Official</span>
                  <span className="text-neutral-300">+256752759996</span>
                </div>
              </a>

              <a
                href={`tel:${GL_PHONE_INTERNATIONAL}`}
                className="flex items-start gap-2.5 hover:text-emerald-400 transition-colors group"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block font-medium text-white">Telephone Inquiries</span>
                  <span className="text-neutral-300">0764785491</span>
                </div>
              </a>

              <div className="flex items-start gap-2.5 text-neutral-300">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-white">Countrywide Scope</span>
                  <span>Kampala, Wakiso, Mukono & All 136 Districts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-neutral-100">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-white transition-colors"
                >
                  All Available Land Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { category: 'Residential Plot' })}
                  className="hover:text-white transition-colors"
                >
                  Residential Plots for Sale
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { category: 'Commercial Land' })}
                  className="hover:text-white transition-colors"
                >
                  Commercial Roadside Plots
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog', { category: 'Agricultural Land' })}
                  className="hover:text-white transition-colors"
                >
                  Farmland & Acreage
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('guide')}
                  className="hover:text-white transition-colors"
                >
                  Ugandan Land Due Diligence Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Due Diligence Notice */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Buyer Due Diligence</span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-300">
              GL Real Estates encourages all prospective land buyers to conduct independent verification: search land records at the Ministry of Lands, Housing and Urban Development (MLHUD) Zonal Office, verify physical boundary cornerstones with a registered surveyor, and secure Local Council (LC1) consent before signing contracts or releasing funds.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Legal Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} GL Real Estates (Glorious Living). All rights reserved across Uganda.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-neutral-200 transition-colors"
            >
              Privacy & Operations Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-neutral-200 transition-colors"
            >
              Terms of Property Inquiry
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onNavigate('guide')}
              className="hover:text-neutral-200 transition-colors"
            >
              Land Verification Notice
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
