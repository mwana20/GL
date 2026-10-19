import React from 'react';
import { MessageCircle } from 'lucide-react';
import { buildGeneralWhatsAppUrl } from '../utils/formatters';

export const WhatsAppButton: React.FC = () => {
  return (
    <aside aria-label="WhatsApp quick contact" className="fixed bottom-6 right-6 z-30 group">
      <a
        href={buildGeneralWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-3 bg-[#25D366] text-white font-semibold text-xs rounded-full shadow-lg hover:bg-[#20ba59] hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
        aria-label="Direct WhatsApp Chat with GL Real Estates (+256752759996)"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline-block tracking-wide">
          WhatsApp Us
        </span>
      </a>
    </aside>
  );
};
