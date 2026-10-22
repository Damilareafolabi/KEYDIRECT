import React, { useState } from 'react';
import { 
  X, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Share2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  FileText,
  BadgeCheck,
  RotateCw,
  Video,
  Star,
  Lock,
  Ban
} from 'lucide-react';
import { Property, SupportedLanguage } from '../types';
import { convertCurrency, formatCurrency } from '../utils/currency';
import { TRANSLATIONS } from '../utils/i18n';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  currentCurrency: string;
  currentLanguage: SupportedLanguage;
  onOpenChat: (property: Property) => void;
  onScheduleInspection: (property: Property) => void;
  onOpenVirtualLook: (property: Property) => void;
  onOpenVideoCall: (property: Property) => void;
  onOpenSafePay: (property: Property) => void;
  onOpenReviews: (property: Property) => void;
  onOpenReportRogue: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  currentCurrency,
  currentLanguage,
  onOpenChat,
  onScheduleInspection,
  onOpenVirtualLook,
  onOpenVideoCall,
  onOpenSafePay,
  onOpenReviews,
  onOpenReportRogue,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!property) return null;

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const convertedPrice = convertCurrency(property.basePrice, property.baseCurrency, currentCurrency);
  const isDirectOwner = property.listingType === 'Direct Owner';

  // Fee calculation comparison
  const agentFeeAvoided = isDirectOwner ? convertedPrice * 0.10 : 0;
  const agreementFee = isDirectOwner ? convertedPrice * 0.05 : convertedPrice * 0.10;
  const traditionalTotal = convertedPrice + (convertedPrice * 0.10) + (convertedPrice * 0.10) + 15000;
  const keyDirectTotal = convertedPrice + agreementFee;
  const totalMoneySaved = traditionalTotal - keyDirectTotal;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `KeyDirect Verified Listing: ${property.title} in ${property.neighbourhood}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
              isDirectOwner 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-stone-100 text-stone-800'
            }`}>
              {property.listingType}
            </span>
            <span className="text-xs font-semibold text-stone-400">·</span>
            <span className="text-xs font-semibold text-stone-600">{property.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Share Listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isSaved ? 'text-red-600 bg-red-50' : 'text-stone-600 hover:bg-stone-100'
              }`}
              title="Save to Favorites"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 space-y-6">
          
          {/* Gallery Carousel */}
          <div className="relative rounded-2xl overflow-hidden aspect-16/9 bg-stone-900 group">
            <img
              src={property.images[activeImageIndex] || property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            {/* Launch 360° Virtual Look Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => onOpenVirtualLook(property)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl transition-all cursor-pointer backdrop-blur-md animate-pulse"
              >
                <RotateCw className="w-4 h-4" />
                <span>Launch 360° Virtual Look (₦0 Fee)</span>
              </button>
            </div>
            
            {/* Gallery Navigation Buttons */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : property.images.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev < property.images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Thumbnail selector */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4 pointer-events-auto">
              {property.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-14 h-9 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === i ? 'border-white scale-105 shadow-md' : 'border-black/50 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                {property.title}
              </h2>
              <div className="flex items-center gap-1.5 text-stone-500 text-sm mt-1.5">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <span>{property.address}, {property.neighbourhood}, {property.state}</span>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="font-heading text-3xl font-black text-stone-900 tracking-tight">
                {formatCurrency(convertedPrice, currentCurrency)}
              </div>
              <div className="text-stone-500 text-xs font-semibold uppercase tracking-wider">
                /{property.pricePeriod} (Base: {property.baseCurrency})
              </div>
            </div>
          </div>

          {/* Anti-Scam Verification Card (C of O / Governor's Consent / NIN) */}
          <div className="bg-emerald-50/80 rounded-2xl border border-emerald-200 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-heading font-bold text-emerald-950 text-sm sm:text-base">
                    Verified Title & Anti-Scam Shield
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-200 text-emerald-900">
                    Status: {property.verification.verificationStatus}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-1">
                  Title Document: <strong>{property.verification.documentType}</strong> · Inspected by {property.verification.inspectorName || 'SimeonJrStudios Verification Board'} on {property.verification.verifiedAt}.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-emerald-200/80 text-[11px] font-semibold text-emerald-900">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>NIN Identity Match</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>BVN Fraud Registry Clean</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Physical On-Site Verified</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Zero Bogus Inspection Fee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Fee Comparison (Direct Owner vs Traditional Agent) */}
          {isDirectOwner && (
            <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="font-heading font-bold text-sm tracking-wide">
                    Direct Owner Transparent Pricing Breakdown
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                  You Save: {formatCurrency(totalMoneySaved, currentCurrency)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Traditional Agent Breakdown */}
                <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 space-y-1.5 opacity-80">
                  <div className="font-bold text-stone-400 uppercase text-[10px] tracking-wider">
                    Traditional Street Agency (Heavy Markups)
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>Rent:</span>
                    <span>{formatCurrency(convertedPrice, currentCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-red-400 font-medium">
                    <span>Agent Commission (10%):</span>
                    <span>+{formatCurrency(convertedPrice * 0.10, currentCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Agreement/Legal Fee (10%):</span>
                    <span>+{formatCurrency(convertedPrice * 0.10, currentCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Caution Fee / Inspection Fee:</span>
                    <span>+₦15,000</span>
                  </div>
                  <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-stone-300">
                    <span>Total Move-in Cost:</span>
                    <span>{formatCurrency(traditionalTotal, currentCurrency)}</span>
                  </div>
                </div>

                {/* KeyDirect Direct Price */}
                <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/50 space-y-1.5">
                  <div className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">
                    KeyDirect Direct Owner Model (Transparent)
                  </div>
                  <div className="flex justify-between text-stone-200">
                    <span>Direct Owner Rent:</span>
                    <span>{formatCurrency(convertedPrice, currentCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Agent Commission:</span>
                    <span>₦0 (0% Fee)</span>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>Digital Tenancy Agreement (Flat 5%):</span>
                    <span>{formatCurrency(agreementFee, currentCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Inspection Fee:</span>
                    <span>Free</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-800/50 flex justify-between font-bold text-white text-sm">
                    <span>Total Move-in Cost:</span>
                    <span className="text-emerald-400">{formatCurrency(keyDirectTotal, currentCurrency)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
              <Bed className="w-5 h-5 text-stone-500 mx-auto mb-1" />
              <div className="font-heading font-black text-lg text-stone-900">{property.bedrooms}</div>
              <div className="text-[11px] text-stone-500 uppercase font-semibold">Bedrooms</div>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
              <Bath className="w-5 h-5 text-stone-500 mx-auto mb-1" />
              <div className="font-heading font-black text-lg text-stone-900">{property.bathrooms}</div>
              <div className="text-[11px] text-stone-500 uppercase font-semibold">Bathrooms</div>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
              <Square className="w-5 h-5 text-stone-500 mx-auto mb-1" />
              <div className="font-heading font-black text-lg text-stone-900">
                {property.areaSqFt ? property.areaSqFt.toLocaleString() : 'N/A'}
              </div>
              <div className="text-[11px] text-stone-500 uppercase font-semibold">Square Feet</div>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
              <BadgeCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="font-heading font-black text-lg text-emerald-700">100%</div>
              <div className="text-[11px] text-stone-500 uppercase font-semibold">Title Verified</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-heading font-bold text-stone-900 text-base mb-2">
              Property Overview
            </h4>
            <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h4 className="font-heading font-bold text-stone-900 text-base mb-2.5">
              Features & Amenities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {property.amenities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Landlord / Advertiser Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={property.owner.avatar}
                alt={property.owner.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-red-500/30 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-stone-900 text-base">
                    {property.owner.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Verified {property.owner.role}
                  </span>
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Rating: ⭐ {property.owner.rating} · Response time: {property.owner.responseTime} · {property.owner.phone}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onOpenChat(property)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Directly</span>
              </button>

              <button
                onClick={() => onScheduleInspection(property)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Inspection</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer Safety Warning */}
        <div className="bg-amber-50 px-6 py-3 border-t border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Anti-Scam Protection:</strong> Never transfer funds to personal bank accounts for inspection passes. Official physical inspections are 100% free under KeyDirect trust policy.
          </span>
        </div>

      </div>
    </div>
  );
};
