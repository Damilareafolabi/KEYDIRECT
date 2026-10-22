import React from 'react';
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  Eye, 
  CheckCircle2, 
  Sparkles,
  Zap,
  RotateCw,
  Video,
  PartyPopper
} from 'lucide-react';
import { Property, SupportedLanguage } from '../types';
import { convertCurrency, formatCurrency } from '../utils/currency';
import { TRANSLATIONS } from '../utils/i18n';

interface PropertyCardProps {
  property: Property;
  currentCurrency: string;
  currentLanguage: SupportedLanguage;
  onSelectProperty: (property: Property) => void;
  onOpenChat: (property: Property) => void;
  onOpenVirtualLook: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  currentCurrency,
  currentLanguage,
  onSelectProperty,
  onOpenChat,
  onOpenVirtualLook,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Convert base price to active target currency
  const convertedPrice = convertCurrency(
    property.basePrice,
    property.baseCurrency,
    currentCurrency
  );

  // Calculate estimated agent commission savings (10%)
  const estimatedSavings = convertedPrice * 0.10;

  const isDirectOwner = property.listingType === 'Direct Owner';
  const isDeveloper = property.listingType === 'Developer';
  const isParty = property.category === 'Party Apartments';
  const isEvent = property.category === 'Event Centers';

  return (
    <div className="group bg-white rounded-3xl border border-stone-200/90 hover:border-red-500/50 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Property Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onSelectProperty(property)}>
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Listing Type Tag */}
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
              isDirectOwner
                ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
                : isDeveloper
                ? 'bg-indigo-600/90 text-white border border-indigo-400/40'
                : 'bg-stone-900/90 text-stone-200 border border-stone-700/50'
            }`}
          >
            {isDirectOwner ? 'Direct Owner (0% Fee)' : property.listingType}
          </span>

          {/* Virtual Look Available Pill */}
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600/95 text-white text-[11px] font-black backdrop-blur-md shadow-md animate-pulse">
            <RotateCw className="w-3.5 h-3.5" />
            <span>360° Virtual Look</span>
          </span>
        </div>

        {/* Bottom image metadata: Category & City */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium pointer-events-none">
          <span className="bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold">
            {isParty && <PartyPopper className="w-3 h-3 text-red-400" />}
            {property.category}
          </span>
          <span className="bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
            <MapPin className="w-3 h-3 text-red-400" />
            {property.neighbourhood.split(',')[0]}, {property.state}
          </span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          {/* Price & Savings Pill */}
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {formatCurrency(convertedPrice, currentCurrency)}
              </span>
              <span className="text-stone-500 text-xs font-semibold">
                /{property.pricePeriod}
              </span>
            </div>
            
            {/* ₦0 Inspection Fee Guarantee Callout */}
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
              <Zap className="w-3 h-3 text-emerald-600" />
              ₦0 Inspection Fee
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectProperty(property)}
            className="font-heading text-base font-bold text-stone-900 hover:text-red-600 transition-colors line-clamp-1 cursor-pointer"
          >
            {property.title}
          </h3>

          {/* Location / Neighbourhood */}
          <p className="text-xs text-stone-500 flex items-center gap-1 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{property.address}</span>
          </p>
        </div>

        {/* Specifications Strip: Beds, Baths, Capacity, Title */}
        <div className="flex items-center gap-3 py-2 border-y border-stone-100 text-xs text-stone-600">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-stone-400" />
              <span>{property.bedrooms} Beds</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-stone-400" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}
          {property.eventSpecs?.guestCapacity && (
            <div className="flex items-center gap-1 font-bold text-stone-800">
              <PartyPopper className="w-3.5 h-3.5 text-red-500" />
              <span>{property.eventSpecs.guestCapacity} Guests</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{property.verification.documentType}</span>
          </div>
        </div>

        {/* Action Buttons: Virtual Look (FREE) + Chat + Inspect */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
          
          {/* Owner info */}
          <div className="flex items-center gap-2 overflow-hidden max-w-[130px]">
            <img
              src={property.owner.avatar}
              alt={property.owner.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-200 shrink-0"
            />
            <div className="text-[11px] leading-tight truncate">
              <div className="font-bold text-stone-800 truncate">{property.owner.name}</div>
              <div className="text-stone-400 font-medium">{property.owner.role}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            
            {/* Primary Virtual Look 360 Button */}
            <button
              onClick={() => onOpenVirtualLook(property)}
              className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              title="Inspect 360° Panorama and HD Video Walkthrough Online for Free"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Virtual Look</span>
            </button>

            <button
              onClick={() => onOpenChat(property)}
              className="px-2 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="Chat Directly With Landlord"
            >
              <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
            </button>

            <button
              onClick={() => onSelectProperty(property)}
              className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="View Complete Property Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
