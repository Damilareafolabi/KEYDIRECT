import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../utils/i18n';
import { HeroHighlightCards } from './HeroHighlightCards';

interface HeroProps {
  currentLanguage: SupportedLanguage;
  onSelectRole: (role: 'Owners' | 'Agents' | 'Developers') => void;
  onOpenListProperty: () => void;
  activeRole: string;
  onOpenVirtualLookDemo: () => void;
  onFilterDirectOwners: () => void;
  onFilterFreeInspection: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentLanguage,
  onSelectRole,
  onOpenListProperty,
  activeRole,
  onOpenVirtualLookDemo,
  onFilterDirectOwners,
  onFilterFreeInspection,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <section className="relative bg-stone-950 overflow-hidden pt-12 sm:pt-16 pb-14 sm:pb-20">
      {/* Background Image with Dark Vignette Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
          alt="Modern Architectural Real Estate"
          className="w-full h-full object-cover object-center opacity-45 mix-blend-luminosity scale-105 transform motion-safe:transition-transform motion-safe:duration-10000 hover:scale-100"
        />
        <div className="absolute inset-0 bg-linear-to-b from-stone-950/90 via-stone-950/70 to-stone-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.12)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Anti-Scam Certified Header Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/90 border border-stone-800 text-stone-200 text-xs font-semibold mb-6 shadow-xl backdrop-blur-md">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span>⚡ Free Virtual Look</span>
          </span>
          <span className="text-stone-600">|</span>
          <span className="text-white font-black bg-red-600 px-2 py-0.5 rounded text-[11px]">
            ₦0 Inspection Fees
          </span>
          <span className="text-stone-600 hidden sm:inline">|</span>
          <span className="text-stone-300 hidden sm:inline font-bold">100% Direct Owner Access</span>
        </div>

        {/* Main Headline (Matching Reference Image) */}
        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-[1.1] mb-5">
          {t.heroHeadline}
        </h1>

        {/* Subheadline (Matching Reference Image) */}
        <p className="max-w-3xl mx-auto text-sm sm:text-lg text-stone-300 font-normal leading-relaxed mb-8 sm:mb-10">
          {t.heroSubheadline}
        </p>

        {/* Target Role Selectors (Matching Reference Image Pills) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-2">
          
          {/* Owners -> */}
          <button
            onClick={() => onSelectRole('Owners')}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeRole === 'Owners'
                ? 'bg-white text-stone-900 shadow-lg shadow-white/10 ring-2 ring-red-500'
                : 'bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/80 hover:border-stone-500'
            }`}
          >
            <span>{t.owners}</span>
            <ArrowRight className="w-3.5 h-3.5 text-red-500" />
          </button>

          {/* Agents -> */}
          <button
            onClick={() => onSelectRole('Agents')}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeRole === 'Agents'
                ? 'bg-white text-stone-900 shadow-lg ring-2 ring-red-500'
                : 'bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/80 hover:border-stone-500'
            }`}
          >
            <span>{t.agents}</span>
            <ArrowRight className="w-3.5 h-3.5 text-red-500" />
          </button>

          {/* Developers -> */}
          <button
            onClick={() => onSelectRole('Developers')}
            className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeRole === 'Developers'
                ? 'bg-white text-stone-900 shadow-lg ring-2 ring-red-500'
                : 'bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/80 hover:border-stone-500'
            }`}
          >
            <span>{t.developers}</span>
            <ArrowRight className="w-3.5 h-3.5 text-red-500" />
          </button>

          {/* List your property */}
          <button
            onClick={onOpenListProperty}
            className="px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-stone-200 bg-stone-900/80 hover:bg-red-600 hover:text-white border border-stone-700/80 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>{t.listYourProperty}</span>
          </button>

        </div>

      </div>

      {/* 3 Horizontal Hero Highlight Cards & Red Capsule Banner matching reference image */}
      <HeroHighlightCards
        onOpenVirtualLookDemo={onOpenVirtualLookDemo}
        onFilterDirectOwners={onFilterDirectOwners}
        onFilterFreeInspection={onFilterFreeInspection}
      />
    </section>
  );
};
