/**
 * KeyDirect Real Estate
 * Tagline: "Real People. Real Places. Direct Connections."
 * Parent Company: SimeonJrStudios
 * Leadership: CEO Afolabi Oluwadamilare Simeon
 */

import React, { useState, useMemo } from 'react';
import { 
  KeyRound, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Tv, 
  Code2, 
  CheckCircle2, 
  Filter, 
  ArrowRight, 
  Sparkles, 
  X,
  Phone,
  Mail,
  Zap,
  Building,
  HeartHandshake,
  RotateCw,
  Users,
  PartyPopper,
  TrendingUp,
  Share2,
  Bot
} from 'lucide-react';

import { 
  Property, 
  PropertyCategory, 
  ListingType, 
  SupportedLanguage, 
  UserRole, 
  LandAction,
  BusinessBillboardAd,
  LazyCeoLead 
} from './types';
import { INITIAL_PROPERTIES, INITIAL_BUSINESS_BILLBOARDS } from './data/properties';
import { CURRENCY_RATES, convertCurrency, formatCurrency } from './utils/currency';
import { TRANSLATIONS } from './utils/i18n';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchCard } from './components/SearchCard';
import { PromoBanner } from './components/PromoBanner';
import { PropertyCard } from './components/PropertyCard';
import { PropertyMap } from './components/PropertyMap';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { DirectChatDrawer } from './components/DirectChatDrawer';
import { DigitalBillboardModal } from './components/DigitalBillboardModal';
import { AntiScamModal } from './components/AntiScamModal';
import { BackendCodeModal } from './components/BackendCodeModal';
import { ListPropertyModal } from './components/ListPropertyModal';
import { AuthModal } from './components/AuthModal';
import { TrustStatsBanner } from './components/TrustStatsBanner';

// New Core Innovations Components
import { VirtualLookModal } from './components/VirtualLookModal';
import { CommunityChatModal } from './components/CommunityChatModal';
import { PublisherPortalModal } from './components/PublisherPortalModal';
import { AccountAnalyticsModal } from './components/AccountAnalyticsModal';
import { SocialMediaAutoPosterModal } from './components/SocialMediaAutoPosterModal';
import { LazyCeoHunter } from './components/LazyCeoHunter';
import { LazyCeoModal } from './components/LazyCeoModal';

export default function App() {
  // Global & Localized State
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [billboardAds, setBillboardAds] = useState<BusinessBillboardAd[]>(INITIAL_BUSINESS_BILLBOARDS);
  const [lazyCeoLeads, setLazyCeoLeads] = useState<LazyCeoLead[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState<string>('NGN');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  // Filter States
  const [activeCategory, setActiveCategory] = useState<PropertyCategory>('Cities');
  const [landAction, setLandAction] = useState<LandAction>('Any');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('All Types');
  const [bedroomCount, setBedroomCount] = useState<string>('Bedrooms Any');
  const [minBudget, setMinBudget] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [advertiserFilter, setAdvertiserFilter] = useState<string>('Owners and agents');
  const [isMapView, setIsMapView] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<string>('Owners');

  // Modals & Drawers States
  const [selectedPropertyForDetail, setSelectedPropertyForDetail] = useState<Property | null>(null);
  const [selectedPropertyForChat, setSelectedPropertyForChat] = useState<Property | null>(null);
  const [selectedPropertyForVirtualLook, setSelectedPropertyForVirtualLook] = useState<Property | null>(null);
  
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isBillboardOpen, setIsBillboardOpen] = useState<boolean>(false);
  const [isAntiScamOpen, setIsAntiScamOpen] = useState<boolean>(false);
  const [isBackendCodeOpen, setIsBackendCodeOpen] = useState<boolean>(false);
  const [isListPropertyOpen, setIsListPropertyOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isCommunityChatOpen, setIsCommunityChatOpen] = useState<boolean>(false);
  const [isPublisherPortalOpen, setIsPublisherPortalOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isSocialPosterOpen, setIsSocialPosterOpen] = useState<boolean>(false);
  const [isLazyCeoModalOpen, setIsLazyCeoModalOpen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<{ name: string; role: UserRole; email: string } | null>({
    name: 'Afolabi Simeon',
    role: 'Owner',
    email: 'dammyblack88@gmail.com',
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add newly published property from Publisher Portal
  const handleAddProperty = (newProp: Property) => {
    setProperties((prev) => [newProp, ...prev]);
    showToast(`Property "${newProp.title}" published with KYC verification!`);
  };

  // Add newly submitted billboard ad from any business
  const handleAddBillboardAd = (ad: BusinessBillboardAd) => {
    setBillboardAds((prev) => [ad, ...prev]);
    showToast(`Billboard Ad for "${ad.businessName}" is now LIVE!`);
  };

  // Capture lead from LazyCEO autonomous hunter
  const handleLeadCaptured = (lead: LazyCeoLead) => {
    setLazyCeoLeads((prev) => [lead, ...prev]);
    showToast(`⚡ LazyCEO Hunted a Lead: "${lead.clientNeed.slice(0, 35)}..."!`);
  };

  // Role button selector handler
  const handleSelectRole = (role: 'Owners' | 'Agents' | 'Developers') => {
    setActiveRole(role);
    if (role === 'Owners') {
      setAdvertiserFilter('Direct Owners Only');
      showToast('Filtered to 0% Agent Commission Direct Owner listings!');
    } else if (role === 'Agents') {
      setAdvertiserFilter('Verified Agents');
      showToast('Filtered to verified licensed agents!');
    } else if (role === 'Developers') {
      setAdvertiserFilter('Developers');
      showToast('Filtered to primary real estate developer projects!');
    }
  };

  // Filter properties logic
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Category filter
      if (activeCategory !== 'Cities' && activeCategory !== 'Rental') {
        if (prop.category !== activeCategory) return false;
      }

      // Land action filter (if on Plots / Land)
      if (activeCategory === 'Plots / Land' && landAction !== 'Any') {
        if (prop.landAction && prop.landAction !== landAction) return false;
      }

      // Location / Search text
      if (searchLocation.trim()) {
        const query = searchLocation.toLowerCase().trim();
        const matchesLocation =
          prop.state.toLowerCase().includes(query) ||
          prop.neighbourhood.toLowerCase().includes(query) ||
          prop.lga.toLowerCase().includes(query) ||
          prop.address.toLowerCase().includes(query) ||
          prop.title.toLowerCase().includes(query);
        if (!matchesLocation) return false;
      }

      // Property Type
      if (propertyType !== 'All Types') {
        if (!prop.title.toLowerCase().includes(propertyType.toLowerCase()) && 
            !prop.description.toLowerCase().includes(propertyType.toLowerCase())) {
          return false;
        }
      }

      // Bedroom count
      if (bedroomCount !== 'Bedrooms Any') {
        const count = parseInt(bedroomCount.split(' ')[0].replace('+', ''));
        if (bedroomCount.includes('+')) {
          if (prop.bedrooms < count) return false;
        } else {
          if (prop.bedrooms !== count) return false;
        }
      }

      // Advertiser filter
      if (advertiserFilter === 'Direct Owners Only') {
        if (prop.listingType !== 'Direct Owner') return false;
      } else if (advertiserFilter === 'Verified Agents') {
        if (prop.listingType !== 'Verified Agent') return false;
      } else if (advertiserFilter === 'Developers') {
        if (prop.listingType !== 'Developer') return false;
      }

      // Min budget filter (converted to current active currency)
      if (minBudget.trim()) {
        const minVal = parseFloat(minBudget.replace(/[^0-9.]/g, ''));
        if (!isNaN(minVal)) {
          const propPriceInCurrentCurrency = convertCurrency(prop.basePrice, prop.baseCurrency, currentCurrency);
          if (propPriceInCurrentCurrency < minVal) return false;
        }
      }

      // Max budget filter
      if (maxBudget.trim()) {
        const maxVal = parseFloat(maxBudget.replace(/[^0-9.]/g, ''));
        if (!isNaN(maxVal)) {
          const propPriceInCurrentCurrency = convertCurrency(prop.basePrice, prop.baseCurrency, currentCurrency);
          if (propPriceInCurrentCurrency > maxVal) return false;
        }
      }

      return true;
    });
  }, [
    properties,
    activeCategory,
    landAction,
    searchLocation,
    propertyType,
    bedroomCount,
    advertiserFilter,
    minBudget,
    maxBudget,
    currentCurrency,
  ]);

  const directOwnerCount = filteredProperties.filter((p) => p.listingType === 'Direct Owner').length;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-red-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Floating LazyCEO Autonomous Client Hunter */}
      <LazyCeoHunter
        activeCategory={activeCategory}
        onOpenLeadPipeline={() => setIsLazyCeoModalOpen(true)}
        onLeadCaptured={handleLeadCaptured}
      />

      {/* Top Navbar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          if (cat === 'Rental') {
            setAdvertiserFilter('Direct Owners Only');
          }
        }}
        currentCurrency={currentCurrency}
        onSelectCurrency={setCurrentCurrency}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        onOpenBillboard={() => setIsBillboardOpen(true)}
        onOpenBackendCode={() => setIsBackendCodeOpen(true)}
        onOpenAntiScam={() => setIsAntiScamOpen(true)}
        onOpenListProperty={() => setIsListPropertyOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenChat={() => {
          if (!selectedPropertyForChat && properties.length > 0) {
            setSelectedPropertyForChat(properties[0]);
          }
          setIsChatOpen(true);
        }}
        onOpenCommunityChat={() => setIsCommunityChatOpen(true)}
        onOpenPublisherPortal={() => setIsPublisherPortalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenSocialAutoPoster={() => setIsSocialPosterOpen(true)}
        onOpenLazyCeo={() => setIsLazyCeoModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Hero Section with Virtual Inspection Badge & 3 Horizontal Feature Cards */}
      <Hero
        currentLanguage={currentLanguage}
        onSelectRole={handleSelectRole}
        onOpenListProperty={() => setIsPublisherPortalOpen(true)}
        activeRole={activeRole}
        onOpenVirtualLookDemo={() => {
          if (properties.length > 0) {
            setSelectedPropertyForVirtualLook(properties[0]);
          }
        }}
        onFilterDirectOwners={() => {
          setAdvertiserFilter('Direct Owners Only');
          showToast('Filtering for Direct Owner properties (Zero Agent Commission)');
          const el = document.getElementById('listings-container');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onFilterFreeInspection={() => {
          showToast('⚡ Free Virtual Look & ₦0 Inspection Fee Guarantee active!');
          if (properties.length > 0) {
            setSelectedPropertyForVirtualLook(properties[0]);
          }
        }}
      />

      {/* Floating Filter Card overlapping Hero */}
      <div className="px-4 sm:px-6 lg:px-8">
        <SearchCard
          activeCategory={activeCategory}
          onSelectCategory={(cat) => setActiveCategory(cat)}
          searchLocation={searchLocation}
          onSearchLocationChange={setSearchLocation}
          propertyType={propertyType}
          onPropertyTypeChange={setPropertyType}
          bedroomCount={bedroomCount}
          onBedroomCountChange={setBedroomCount}
          minBudget={minBudget}
          onMinBudgetChange={setMinBudget}
          maxBudget={maxBudget}
          onMaxBudgetChange={setMaxBudget}
          advertiserFilter={advertiserFilter}
          onAdvertiserFilterChange={setAdvertiserFilter}
          landAction={landAction}
          onLandActionChange={setLandAction}
          isMapView={isMapView}
          onToggleMapView={() => setIsMapView(!isMapView)}
          onTriggerSearch={() => {
            showToast(`Found ${filteredProperties.length} verified listings.`);
            const el = document.getElementById('listings-container');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          currentCurrency={currentCurrency}
          currentLanguage={currentLanguage}
        />
      </div>

      {/* Virtual Inspection & Zero ₦10k Inspection Fee Guarantee Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="bg-linear-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <RotateCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-black text-lg sm:text-xl tracking-tight">
                  100% Free Virtual Look & 360° Walkthroughs
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white text-red-700 uppercase">
                  ₦0 Inspection Fee
                </span>
              </div>
              <p className="text-xs sm:text-sm text-red-100 mt-0.5">
                Never pay ₦10,000 or outrageous inspection fees again! Take 360° virtual tours of party penthouses, event arenas & apartments online before direct owner handover.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (properties.length > 0) {
                  setSelectedPropertyForVirtualLook(properties[0]);
                }
              }}
              className="px-5 py-2.5 bg-white hover:bg-stone-100 text-red-600 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCw className="w-4 h-4" />
              <span>Try 360° Demo Tour</span>
            </button>
          </div>
        </div>
      </section>

      {/* Promo Banner Section ("Get Property Directly from the Owner") */}
      <PromoBanner
        currentLanguage={currentLanguage}
        onFilterDirectOwners={() => {
          setAdvertiserFilter('Direct Owners Only');
          showToast('Filtering: Direct from Owner Listings (0% Commission)');
          const el = document.getElementById('listings-container');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAntiScam={() => setIsAntiScamOpen(true)}
      />

      {/* Main Real Estate Listings Section */}
      <main id="listings-container" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Listings Header & Quick Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {activeCategory === 'Cities'
                  ? 'Verified Properties & Party Spaces in Nigeria'
                  : `${activeCategory} in Nigeria`}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                {filteredProperties.length} Available
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                Virtual Tour Ready (₦0 Fee)
              </span>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Direct connection to verified hosts, landlords & developers. All prices converted in real-time to {currentCurrency}.
            </p>
          </div>

          {/* Quick Direct Owner & Map Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (advertiserFilter === 'Direct Owners Only') {
                  setAdvertiserFilter('Owners and agents');
                } else {
                  setAdvertiserFilter('Direct Owners Only');
                  showToast('Showing only Direct Landlord listings (0% Agent Commission)');
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                advertiserFilter === 'Direct Owners Only'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${advertiserFilter === 'Direct Owners Only' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Direct Owners ({directOwnerCount})</span>
            </button>

            <button
              onClick={() => setIsMapView(!isMapView)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {isMapView ? 'Show List View' : 'Show Spatial Map'}
            </button>
          </div>
        </div>

        {/* View Render: Spatial Map or Property Grid */}
        {isMapView ? (
          <PropertyMap
            properties={filteredProperties}
            currentCurrency={currentCurrency}
            currentLanguage={currentLanguage}
            onSelectProperty={(p) => setSelectedPropertyForDetail(p)}
            onOpenChat={(p) => {
              setSelectedPropertyForChat(p);
              setIsChatOpen(true);
            }}
            onCloseMapView={() => setIsMapView(false)}
          />
        ) : (
          <>
            {filteredProperties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-lg text-stone-800">
                  No properties matched your criteria
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try clearing your search location or resetting your minimum budget.
                </p>
                <button
                  onClick={() => {
                    setSearchLocation('');
                    setPropertyType('All Types');
                    setBedroomCount('Bedrooms Any');
                    setMinBudget('');
                    setMaxBudget('');
                    setAdvertiserFilter('Owners and agents');
                    setActiveCategory('Cities');
                    setLandAction('Any');
                  }}
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-red-700"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    currentCurrency={currentCurrency}
                    currentLanguage={currentLanguage}
                    onSelectProperty={(p) => setSelectedPropertyForDetail(p)}
                    onOpenChat={(p) => {
                      setSelectedPropertyForChat(p);
                      setIsChatOpen(true);
                    }}
                    onOpenVirtualLook={(p) => setSelectedPropertyForVirtualLook(p)}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </main>

      {/* Trust & Anti-Scam Statistics Banner */}
      <TrustStatsBanner />

      {/* Global Real Estate Footer */}
      <footer className="bg-stone-950 text-stone-400 text-xs border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
            
            {/* Brand column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 -rotate-45" />
                </div>
                <div>
                  <div className="font-heading font-black text-base text-white tracking-tight">KEYDIRECT</div>
                  <div className="text-[9px] tracking-widest text-red-500 font-bold uppercase">REAL ESTATE</div>
                </div>
              </div>
              <p className="text-stone-400 leading-relaxed">
                Direct connections to real property owners. 100% Free Virtual Look & 360° Walkthroughs. ₦0 Inspection Fee Guarantee.
              </p>
              <div className="text-[11px] text-stone-500">
                Engineered by <strong className="text-white">SimeonJrStudios</strong><br />
                Leadership: <strong>CEO Afolabi Oluwadamilare Simeon</strong>
              </div>
            </div>

            {/* Popular Categories */}
            <div>
              <div className="font-heading font-bold text-white uppercase text-xs tracking-wider mb-3">
                Party, Events & Land
              </div>
              <ul className="space-y-2">
                <li><button onClick={() => { setActiveCategory('Party Apartments'); }} className="hover:text-white cursor-pointer">Party Apartments & Rooftop Pools</button></li>
                <li><button onClick={() => { setActiveCategory('Event Centers'); }} className="hover:text-white cursor-pointer">Event Centers & Marquees (1,500 Cap)</button></li>
                <li><button onClick={() => { setActiveCategory('Plots / Land'); setLandAction('Buy Land'); }} className="hover:text-white cursor-pointer">Buy Land with C of O (Outright)</button></li>
                <li><button onClick={() => { setActiveCategory('Plots / Land'); setLandAction('Rent / Lease Land'); }} className="hover:text-white cursor-pointer">Rent / Lease Commercial Land</button></li>
                <li><button onClick={() => setIsBillboardOpen(true)} className="hover:text-white cursor-pointer">Global Digital Billboard for Any Business</button></li>
              </ul>
            </div>

            {/* Innovation Tools */}
            <div>
              <div className="font-heading font-bold text-white uppercase text-xs tracking-wider mb-3">
                Innovations & Automation
              </div>
              <ul className="space-y-2">
                <li><button onClick={() => { if (properties.length > 0) setSelectedPropertyForVirtualLook(properties[0]); }} className="hover:text-white cursor-pointer font-bold text-red-400">Virtual Look 360° Theater (₦0 Fee)</button></li>
                <li><button onClick={() => setIsLazyCeoModalOpen(true)} className="hover:text-white cursor-pointer">LazyCEO™ Client-Hunter Agent</button></li>
                <li><button onClick={() => setIsSocialPosterOpen(true)} className="hover:text-white cursor-pointer">Social Media Auto-Poster</button></li>
                <li><button onClick={() => setIsCommunityChatOpen(true)} className="hover:text-white cursor-pointer">Multi-User Community Chat Rooms</button></li>
                <li><button onClick={() => setIsPublisherPortalOpen(true)} className="hover:text-white cursor-pointer">Owner Portal & KYC Verification</button></li>
              </ul>
            </div>

            {/* Direct Contact & Support */}
            <div>
              <div className="font-heading font-bold text-white uppercase text-xs tracking-wider mb-3">
                Direct Contact & Support
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>+234 800-KEYDIRECT (Toll Free)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>trust@keydirect.ng</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setIsPublisherPortalOpen(true)}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Open Owner Portal
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
            <div>
              © 2026 KeyDirect Real Estate · SimeonJrStudios Innovation. Leadership: CEO Afolabi Oluwadamilare Simeon.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>·</span>
              <span>Terms of Service</span>
              <span>·</span>
              <span>Zero Fee Guarantee</span>
            </div>
          </div>

        </div>
      </footer>

      {/* MODALS & PORTALS */}

      {/* 1. Virtual Look 360° & HD Walkthrough Theater */}
      <VirtualLookModal
        property={selectedPropertyForVirtualLook}
        isOpen={Boolean(selectedPropertyForVirtualLook)}
        onClose={() => setSelectedPropertyForVirtualLook(null)}
        currentCurrency={currentCurrency}
        onOpenChat={(p) => {
          setSelectedPropertyForVirtualLook(null);
          setSelectedPropertyForChat(p);
          setIsChatOpen(true);
        }}
      />

      {/* 2. Property Detail Inspection Modal */}
      <PropertyDetailModal
        property={selectedPropertyForDetail}
        onClose={() => setSelectedPropertyForDetail(null)}
        currentCurrency={currentCurrency}
        currentLanguage={currentLanguage}
        onOpenChat={(p) => {
          setSelectedPropertyForDetail(null);
          setSelectedPropertyForChat(p);
          setIsChatOpen(true);
        }}
        onScheduleInspection={(p) => {
          setSelectedPropertyForDetail(null);
          setSelectedPropertyForChat(p);
          setIsChatOpen(true);
          showToast(`Inspection request initiated for ${p.title}! Direct chat opened.`);
        }}
        onOpenVirtualLook={(p) => {
          setSelectedPropertyForDetail(null);
          setSelectedPropertyForVirtualLook(p);
        }}
      />

      {/* 3. Direct Landlord 1-on-1 Chat Drawer */}
      <DirectChatDrawer
        property={selectedPropertyForChat}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* 4. Multi-User Community Chat Rooms */}
      <CommunityChatModal
        isOpen={isCommunityChatOpen}
        onClose={() => setIsCommunityChatOpen(false)}
        currentUser={currentUser}
        onRequireAuth={() => setIsAuthOpen(true)}
        onSelectPropertyById={(id) => {
          const found = properties.find((p) => p.id === id);
          if (found) setSelectedPropertyForDetail(found);
        }}
      />

      {/* 5. Publisher & Property Owner Portal (KYC Verification Center) */}
      <PublisherPortalModal
        isOpen={isPublisherPortalOpen}
        onClose={() => setIsPublisherPortalOpen(false)}
        currentUser={currentUser}
        properties={properties}
        onAddProperty={handleAddProperty}
        onAddBillboardAd={handleAddBillboardAd}
        currentCurrency={currentCurrency}
      />

      {/* 6. Digital Billboard (Properties + ANY Business Worldwide) */}
      <DigitalBillboardModal
        properties={properties}
        isOpen={isBillboardOpen}
        onClose={() => setIsBillboardOpen(false)}
        currentCurrency={currentCurrency}
        onSelectProperty={(p) => setSelectedPropertyForDetail(p)}
        onOpenChat={(p) => {
          setSelectedPropertyForChat(p);
          setIsChatOpen(true);
        }}
        onOpenPublisherPortal={() => setIsPublisherPortalOpen(true)}
        customBusinesses={billboardAds}
      />

      {/* 7. LazyCEO Autonomous Client Hunter Control Panel */}
      <LazyCeoModal
        isOpen={isLazyCeoModalOpen}
        onClose={() => setIsLazyCeoModalOpen(false)}
        leads={lazyCeoLeads}
        onAddManualLead={(lead) => handleLeadCaptured(lead)}
      />

      {/* 8. Account Analytics Modal */}
      <AccountAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        currentUser={currentUser}
        currentCurrency={currentCurrency}
      />

      {/* 9. Social Media Auto-Poster (TikTok, IG, WhatsApp, FB, LinkedIn) */}
      <SocialMediaAutoPosterModal
        isOpen={isSocialPosterOpen}
        onClose={() => setIsSocialPosterOpen(false)}
        properties={properties}
        billboards={billboardAds}
        currentCurrency={currentCurrency}
      />

      {/* 10. Anti-Scam 4-Pillars Trust Hub */}
      <AntiScamModal
        isOpen={isAntiScamOpen}
        onClose={() => setIsAntiScamOpen(false)}
      />

      {/* 11. Django / DRF Code Viewer */}
      <BackendCodeModal
        isOpen={isBackendCodeOpen}
        onClose={() => setIsBackendCodeOpen(false)}
      />

      {/* 12. Quick List Property Modal */}
      <ListPropertyModal
        isOpen={isListPropertyOpen}
        onClose={() => setIsListPropertyOpen(false)}
        onAddProperty={handleAddProperty}
        currentCurrency={currentCurrency}
      />

      {/* 13. Zero-Key Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}! Authenticated as ${user.role}.`);
        }}
      />

    </div>
  );
}
