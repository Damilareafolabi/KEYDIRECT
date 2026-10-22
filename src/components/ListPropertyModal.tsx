import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  ShieldCheck, 
  CheckCircle2, 
  Building, 
  MapPin, 
  FileText, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Property, PropertyCategory, ListingType } from '../types';

interface ListPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (newProp: Property) => void;
  currentCurrency: string;
}

export const ListPropertyModal: React.FC<ListPropertyModalProps> = ({
  isOpen,
  onClose,
  onAddProperty,
  currentCurrency,
}) => {
  const [listingType, setListingType] = useState<ListingType>('Direct Owner');
  const [category, setCategory] = useState<PropertyCategory>('Apartments');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [pricePeriod, setPricePeriod] = useState<'per annum' | 'monthly' | 'total purchase'>('per annum');
  const [state, setState] = useState('Lagos');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('3');
  const [documentType, setDocumentType] = useState<'C of O' | 'Deed of Assignment' | "Governor's Consent">('C of O');
  const [ninNumber, setNinNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('+234 ');
  const [description, setDescription] = useState('');
  const [agreedToZeroFee, setAgreedToZeroFee] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !neighbourhood) return;

    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 5000000;

    const newProperty: Property = {
      id: `kd-user-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description || `Direct ${listingType} listing in ${neighbourhood}, ${state}. Clean title (${documentType}) verified by KeyDirect Trust framework.`,
      category,
      listingType,
      baseCurrency: currentCurrency === 'USD' ? 'USD' : 'NGN',
      basePrice: numericPrice,
      pricePeriod,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 1,
      sittingRooms: 1,
      state,
      lga: 'Eti-Osa',
      neighbourhood,
      address: address || `${neighbourhood}, ${state}`,
      latitude: 6.4474,
      longitude: 3.4723,
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      ],
      isVerifiedListing: true,
      verification: {
        isNinVerified: Boolean(ninNumber),
        isBvnVerified: true,
        documentType,
        verificationStatus: 'Approved',
        verifiedAt: new Date().toISOString().split('T')[0],
        inspectorName: 'SimeonJrStudios Verification Board',
      },
      owner: {
        id: `usr-${Date.now()}`,
        name: ownerName || 'Direct Property Owner',
        role: listingType === 'Direct Owner' ? 'Owner' : 'Agent',
        phone: ownerPhone || '+234 800 000 0000',
        isVerified: true,
        rating: 5.0,
        responseTime: 'Instant',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      amenities: ['Verified Title Document', 'Zero Agent Commission', 'Physical Inspection Available'],
      featuredInBillboard: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddProperty(newProperty);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg tracking-tight">
                List Property on KeyDirect
              </h3>
              <p className="text-xs text-stone-400">
                Direct Landlord & Verified Agent Anti-Scam Enrollment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-heading font-black text-2xl text-stone-900">
              Listing Verified & Published!
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Your property has been indexed and is now discoverable across Nigeria & global investor portals.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            {/* Listing Role Pill Selector */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Listing Entity Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Direct Owner', 'Verified Agent', 'Developer'] as ListingType[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setListingType(r)}
                    className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer border ${
                      listingType === r
                        ? 'bg-red-50 border-red-600 text-red-600 shadow-2xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium"
                >
                  <option value="Apartments">Apartments</option>
                  <option value="Rooms">Rooms</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Hotels">Hotels</option>
                  <option value="Rental">Rental</option>
                  <option value="Plots / Land">Plots / Land</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 3-Bedroom Fully Serviced Flat with BQ"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium"
                />
              </div>
            </div>

            {/* Price & Period */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Price (₦ or USD)
                </label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 15,000,000"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Price Period
                </label>
                <select
                  value={pricePeriod}
                  onChange={(e) => setPricePeriod(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium"
                >
                  <option value="per annum">Per Annum (Yearly)</option>
                  <option value="monthly">Monthly</option>
                  <option value="total purchase">Total Purchase (Outright Sale)</option>
                </select>
              </div>
            </div>

            {/* Location (State & Neighbourhood) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  State / Region
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium"
                >
                  <option value="Lagos">Lagos State</option>
                  <option value="Abuja (FCT)">Abuja (FCT)</option>
                  <option value="Rivers">Rivers (Port Harcourt)</option>
                  <option value="Oyo">Oyo (Ibadan)</option>
                  <option value="Enugu">Enugu State</option>
                  <option value="Dubai">Dubai (UAE)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Neighbourhood
                </label>
                <input
                  type="text"
                  required
                  value={neighbourhood}
                  onChange={(e) => setNeighbourhood(e.target.value)}
                  placeholder="e.g. Lekki Phase 1, Maitama, Old GRA"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium"
                />
              </div>
            </div>

            {/* Title Document Verification & NIN Check */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Anti-Scam Title Verification Verification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase mb-1">
                    Title Document Provided
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as any)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
                  >
                    <option value="C of O">Certificate of Occupancy (C of O)</option>
                    <option value="Governor's Consent">Governor’s Consent</option>
                    <option value="Deed of Assignment">Deed of Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase mb-1">
                    NIN / BVN Verification Hash (Zero-Key Placeholder)
                  </label>
                  <input
                    type="text"
                    value={ninNumber}
                    onChange={(e) => setNinNumber(e.target.value)}
                    placeholder="Enter 11-digit NIN placeholder"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Owner / Agent Full Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Chief Adeleke Johnson"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="text"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-medium"
                />
              </div>
            </div>

            {/* Zero Commission Agreement */}
            <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToZeroFee}
                onChange={(e) => setAgreedToZeroFee(e.target.checked)}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-stone-600 text-[11px]">
                I certify that this property is directly available from me with <strong>zero unnecessary agent commissions</strong> and zero inspection charges.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={!agreedToZeroFee}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              Publish Verified Listing
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
