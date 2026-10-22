import React, { useState } from 'react';
import { 
  X, 
  Tv, 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Phone, 
  ExternalLink, 
  PlusCircle, 
  Building, 
  PartyPopper,
  Music,
  Utensils
} from 'lucide-react';
import { Property, BusinessBillboardAd } from '../types';
import { convertCurrency, formatCurrency } from '../utils/currency';
import { INITIAL_BUSINESS_BILLBOARDS } from '../data/properties';

interface DigitalBillboardModalProps {
  properties: Property[];
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: string;
  onSelectProperty: (property: Property) => void;
  onOpenChat: (property: Property) => void;
  onOpenPublisherPortal: () => void;
  customBusinesses?: BusinessBillboardAd[];
}

export const DigitalBillboardModal: React.FC<DigitalBillboardModalProps> = ({
  properties,
  isOpen,
  onClose,
  currentCurrency,
  onSelectProperty,
  onOpenChat,
  onOpenPublisherPortal,
  customBusinesses = [],
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'properties' | 'businesses'>('all');
  const [selectedBizCategory, setSelectedBizCategory] = useState<string>('All');
  const [activeSlide, setActiveSlide] = useState(0);

  if (!isOpen) return null;

  const billboardProperties = properties.filter((p) => p.featuredInBillboard);
  const allBusinesses = [...customBusinesses, ...INITIAL_BUSINESS_BILLBOARDS];

  const currentItem = billboardProperties[activeSlide] || properties[0];
  const convertedPrice = convertCurrency(currentItem.basePrice, currentItem.baseCurrency, currentCurrency);

  const filteredBusinesses = allBusinesses.filter((b) => {
    if (selectedBizCategory === 'All') return true;
    return b.category.includes(selectedBizCategory);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-stone-950 text-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-stone-800 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/40">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-lg tracking-wide uppercase">
                  KeyDirect Global Digital Billboard
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                  WORLDWIDE LIVE
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Showcase for High-Impact Properties & ANY Business Worldwide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenPublisherPortal();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Promote Your Business Here</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-stone-900/40 border-b border-stone-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'all' ? 'bg-stone-900 text-red-400 border-red-500' : 'text-stone-400 hover:text-white border-transparent'
            }`}
          >
            All Live Billboard Broadcasts
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'properties' ? 'bg-stone-900 text-red-400 border-red-500' : 'text-stone-400 hover:text-white border-transparent'
            }`}
          >
            Spotlight Properties (Parties, Venues & Land)
          </button>
          <button
            onClick={() => setActiveTab('businesses')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'businesses' ? 'bg-stone-900 text-red-400 border-red-500' : 'text-stone-400 hover:text-white border-transparent'
            }`}
          >
            Any Business Showcase (DJs, Catering, Legal, Decor)
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* FEATURED ROTATING PROPERTY SPOTLIGHT (if All or Properties) */}
          {(activeTab === 'all' || activeTab === 'properties') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>VIP Property Billboard Rotation</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <span>Spot {activeSlide + 1} of {billboardProperties.length}</span>
                </div>
              </div>

              <div className="relative aspect-16/9 sm:aspect-21/9 overflow-hidden rounded-3xl bg-stone-900 group border border-stone-800">
                <img
                  src={currentItem.images[0]}
                  alt={currentItem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/40 to-transparent" />

                {/* Overlays */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                    Featured #{activeSlide + 1}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-md flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{currentItem.verification.documentType}</span>
                  </span>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-xl">
                    <div className="font-heading text-xl sm:text-2xl font-black text-white leading-tight">
                      {currentItem.title}
                    </div>
                    <div className="text-stone-300 text-xs sm:text-sm flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{currentItem.neighbourhood}, {currentItem.state}</span>
                      <span className="text-stone-500">·</span>
                      <span className="text-emerald-400 font-bold">{currentItem.listingType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenChat(currentItem);
                      }}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl"
                    >
                      Chat Host
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProperty(currentItem);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md shadow-red-600/30"
                    >
                      <span>Inspect Listing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ticker tabs for slots */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                {billboardProperties.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveSlide(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                      activeSlide === idx
                        ? 'bg-red-600/20 border-red-500 text-white'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    Spot {idx + 1}: {p.neighbourhood.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ANY BUSINESS SHOWCASE SECTION */}
          {(activeTab === 'all' || activeTab === 'businesses') && (
            <div className="space-y-4 pt-4 border-t border-stone-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-heading font-black text-lg text-white">
                    Verified Businesses on the World Billboard
                  </h4>
                  <p className="text-xs text-stone-400">
                    High-demand party vendors, caterers, legal land surveyors & services
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPublisherPortal();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>List Your Business</span>
                </button>
              </div>

              {/* Business Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBusinesses.map((biz) => (
                  <div key={biz.id} className="p-4 rounded-3xl bg-stone-900 border border-stone-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={biz.imageUrl}
                        alt={biz.businessName}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-1 ring-stone-700"
                      />
                      <div className="overflow-hidden flex-1 text-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
                            {biz.category}
                          </span>
                          <span className="text-[10px] text-stone-400 ml-auto font-medium">
                            {biz.targetCity}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-white truncate">{biz.businessName}</h5>
                        <p className="text-stone-400 text-[11px] line-clamp-2 mt-0.5">{biz.tagline}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> {biz.badge}
                      </span>

                      <div className="flex items-center gap-2">
                        {biz.websiteUrl && (
                          <a
                            href={biz.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={`https://wa.me/${biz.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(biz.businessName)}%2C%20saw%20your%20Digital%20Billboard%20on%20KeyDirect!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Phone className="w-3 h-3" />
                          <span>WhatsApp Business</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
