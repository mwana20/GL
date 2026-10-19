import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  FileCheck2, 
  AlertTriangle, 
  Scale, 
  Compass, 
  Phone, 
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  GL_PHONE_NUMBER, 
  GL_PHONE_INTERNATIONAL, 
  buildGeneralWhatsAppUrl 
} from '../utils/formatters';

interface DueDiligenceGuidePageProps {
  onNavigate: (tab: string, extra?: any) => void;
}

export const DueDiligenceGuidePage: React.FC<DueDiligenceGuidePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* 1. DEDICATED HERO SECTION FOR DUE DILIGENCE GUIDE */}
      <section className="relative min-h-[320px] sm:min-h-[380px] flex items-center justify-center bg-neutral-900 text-white overflow-hidden px-4 sm:px-6 lg:px-8 py-16">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero_uganda_landscape_1792429858568.jpg"
            alt="Surveyed Ugandan land boundaries and landscape"
            className="w-full h-full object-cover object-center brightness-100 contrast-105"
          />
          {/* Reduced darkness overlay for bright, visible Ugandan landscape */}
          <div className="absolute inset-0 bg-neutral-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/25 to-neutral-950/35" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-neutral-950/60 backdrop-blur-sm border border-emerald-500/40 text-xs sm:text-sm font-semibold tracking-widest uppercase text-emerald-300 shadow-sm">
            Buyer Protection Protocol · GL Real Estates
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
            Uganda Land Due Diligence Guide
          </h1>
          <p className="text-xs sm:text-base text-neutral-100 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Essential legal, survey, and administrative procedures every land purchaser must perform before executing contracts or releasing funds in Uganda.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-neutral-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Ministry Zonal Office (MZO) Searches</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Cadastral Boundary Openings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Local Council (LC1) Consents</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN GUIDE CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Overview Card */}
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 sm:p-8 space-y-3 text-xs sm:text-sm text-emerald-950">
          <h2 className="font-bold text-base text-emerald-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <span>The Principle of Caveat Emptor (Buyer Beware)</span>
          </h2>
          <p className="leading-relaxed">
            Under Ugandan land law, the purchaser carries the legal obligation to investigate title and physical boundaries. GL Real Estates insists on total transparency: all land documents, survey maps, and location coordinates are provided for your independent verification.
          </p>
        </div>

        {/* Step by Step Breakdown */}
        <div className="space-y-6">
          {/* Step 1 */}
          <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-900 text-white font-bold flex items-center justify-center text-sm">
                1
              </span>
              <h3 className="text-lg font-bold text-neutral-900">
                Conduct an Official Ministry of Lands Title Search
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-neutral-700 space-y-2 leading-relaxed">
              <p>
                Obtain a photocopy of the certificate of title from the vendor or GL Real Estates. Take or submit this copy to the relevant <strong>Ministry Zonal Office (MZO)</strong> of the Ministry of Lands, Housing and Urban Development (MLHUD).
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-2">
                <li>Confirm that the vendor is the registered owner on the White Page / Land Information System (LIS).</li>
                <li>Verify that there are no registered encumbrances, bank mortgages, or court injunctions.</li>
                <li>Ensure there are no registered caveats filed by family members, creditors, or former partners.</li>
              </ul>
            </div>
          </section>

          {/* Step 2 */}
          <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-900 text-white font-bold flex items-center justify-center text-sm">
                2
              </span>
              <h3 className="text-lg font-bold text-neutral-900">
                Cadastral Boundary Opening with a Registered Surveyor
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-neutral-700 space-y-2 leading-relaxed">
              <p>
                Never rely solely on visual inspection or seller pointing. Commission an independent, licensed cadastral surveyor who will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-2">
                <li>Acquire the official job record sheet / deed print from the Department of Surveys and Mapping in Entebbe.</li>
                <li>Physically locate and uncover the concrete survey beacons on the ground.</li>
                <li>Check that the plot size (decimals or acres) on the ground corresponds precisely with the title.</li>
                <li>Confirm that proposed access roads have legal right of way and are not encroaching on wetlands or road reserves (UNRA / KCCA).</li>
              </ul>
            </div>
          </section>

          {/* Step 3 */}
          <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-900 text-white font-bold flex items-center justify-center text-sm">
                3
              </span>
              <h3 className="text-lg font-bold text-neutral-900">
                Local Council (LC1) & Neighbors Community Verification
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-neutral-700 space-y-2 leading-relaxed">
              <p>
                In Uganda, the Local Council One (LC1) Chairperson and adjoining neighbors hold vital institutional memory regarding land occupation:
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-2">
                <li>Confirm the seller's true family identity and history of land ownership in that village.</li>
                <li>Verify that there are no customary occupants (kibanja holders) with unresolved claims.</li>
                <li>Ensure no family disputes or pending estate succession squabbles exist.</li>
              </ul>
            </div>
          </section>

          {/* Step 4 */}
          <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-900 text-white font-bold flex items-center justify-center text-sm">
                4
              </span>
              <h3 className="text-lg font-bold text-neutral-900">
                Execution of the Formal Sale Agreement
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-neutral-700 space-y-2 leading-relaxed">
              <p>
                Engage an enrolled Ugandan advocate to draft or review the sale agreement. Ensure the agreement includes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-2">
                <li>Full names, National Identification Numbers (NIN), and signatures of buyer and seller.</li>
                <li>Accurate description of the land: Block, Plot Number, District, and Subcounty.</li>
                <li>Agreed purchase price in Ugandan Shillings (UGX) and terms of settlement.</li>
                <li>Spousal consent (as mandatory under Section 39 of the Land Act for matrimonial land).</li>
                <li>Endorsements and official stamps from the LC1 leadership.</li>
              </ul>
            </div>
          </section>

          {/* Step 5 */}
          <section className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-900 text-white font-bold flex items-center justify-center text-sm">
                5
              </span>
              <h3 className="text-lg font-bold text-neutral-900">
                Valuation, Stamp Duty Payment & Title Transfer
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-neutral-700 space-y-2 leading-relaxed">
              <p>
                Once payment is finalized, complete the transfer of ownership:
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-2">
                <li>Submit transfer forms and passport photos to the Chief Government Valuer (CGV) for property assessment.</li>
                <li>Pay the assessed Stamp Duty (1.5% of value) and registration fees via the Uganda Revenue Authority (URA) portal.</li>
                <li>Submit the original title deed, duplicate transfer deeds, and receipts to the MZO for registration into your name.</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Help & Support Banner */}
        <div className="bg-neutral-100 rounded-2xl p-6 sm:p-8 border border-neutral-200 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-bold text-neutral-900 text-base">
              Need Guidance on a Specific Plot?
            </h4>
            <p className="text-xs text-neutral-600">
              GL Real Estates facilitates field visits and connects you with accredited surveyors across Uganda.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={buildGeneralWhatsAppUrl('Due Diligence Assistance Inquiry')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm"
            >
              Inquire on WhatsApp
            </a>
            <button
              onClick={() => onNavigate('catalog')}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg"
            >
              Browse Land Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
