import React, { useState } from 'react';
import {
  MapPin,
  Star,
  Plus,
  Search,
  Filter,
  DollarSign,
  Mail,
  Phone,
  CheckCircle,
  ExternalLink,
  Bookmark,
  X,
} from 'lucide-react';
import { EventItem, ExpenseCategory, ExpenseItem, VendorItem } from '../../types';
import { CURATED_VENDORS } from '../../lib/curatedVendors';

interface VendorDirectoryProps {
  event: EventItem | null;
  customVendors: VendorItem[];
  onAddCustomVendor: (vendor: VendorItem) => void;
  onLinkVendorToBudget: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
}

const CATEGORIES = [
  'All',
  'Venue & Rental',
  'Catering & Bar',
  'Photography & Video',
  'Music & Entertainment',
  'Decor & Florals',
];

export const VendorDirectory: React.FC<VendorDirectoryProps> = ({
  event,
  customVendors,
  onAddCustomVendor,
  onLinkVendorToBudget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [selectedVendorForBudget, setSelectedVendorForBudget] = useState<VendorItem | null>(null);

  // Budget link modal states
  const [linkAmount, setLinkAmount] = useState('2500');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkNotes, setLinkNotes] = useState('');

  // Custom vendor form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Venue & Rental');
  const [priceRange, setPriceRange] = useState<'$' | '$$' | '$$$' | '$$$$'>('$$');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);

  const allVendors = [...customVendors, ...CURATED_VENDORS];

  const filteredVendors = allVendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || v.category === selectedCategory;
    const matchesPrice = priceFilter === 'all' || v.priceRange === priceFilter;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleOpenBudgetModal = (vendor: VendorItem) => {
    setSelectedVendorForBudget(vendor);
    setLinkTitle(`${vendor.name} Agreement`);
    // Parse estimated number if available
    const match = vendor.estimatedCost.match(/\$?([0-9,]+)/);
    if (match) {
      setLinkAmount(match[1].replace(/,/g, ''));
    } else {
      setLinkAmount('2000');
    }
    setLinkNotes(`Directly linked from vendor directory. Phone: ${vendor.contactPhone}, Email: ${vendor.contactEmail}`);
  };

  const handleConfirmLinkBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !selectedVendorForBudget) return;

    const amt = parseFloat(linkAmount) || 0;
    let mappedCat: ExpenseCategory = 'Miscellaneous';
    if (selectedVendorForBudget.category.includes('Venue')) mappedCat = 'Venue & Rental';
    else if (selectedVendorForBudget.category.includes('Catering')) mappedCat = 'Catering & Bar';
    else if (selectedVendorForBudget.category.includes('Photo')) mappedCat = 'Photography & Video';
    else if (selectedVendorForBudget.category.includes('Music')) mappedCat = 'Music & Entertainment';
    else if (selectedVendorForBudget.category.includes('Decor')) mappedCat = 'Decor & Florals';

    onLinkVendorToBudget({
      eventId: event.id,
      title: linkTitle,
      category: mappedCat,
      plannedAmount: amt,
      actualAmount: amt,
      status: 'pending',
      vendorName: selectedVendorForBudget.name,
      notes: linkNotes,
    });

    setSelectedVendorForBudget(null);
  };

  const handleCreateCustomVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vendor / Venue name is required');
      return;
    }

    const featureList = features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const newVendor: VendorItem = {
      id: `custom-ven-${Date.now()}`,
      name: name.trim(),
      category,
      rating: 5.0,
      reviewCount: 1,
      priceRange,
      estimatedCost: estimatedCost.trim() || '$1,500',
      capacity: capacity.trim() || undefined,
      location: location.trim() || 'Local area',
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      description: description.trim() || 'Custom private service provider.',
      features: featureList.length > 0 ? featureList : ['Private Quote', 'Contractor'],
      isCustom: true,
    };

    onAddCustomVendor(newVendor);
    setIsAddCustomOpen(false);
  };

  const handleSearchOnline = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchNotice(null);
    setSearchResults([]);

    try {
      const response = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.slice(0, 500), // Limit query length
          category: selectedCategory === 'All' ? undefined : selectedCategory,
        }),
      });

      const data = await response.json();

      if (data.success && data.results && data.results.length > 0) {
        setSearchResults(data.results);
        if (data.notice) {
          setSearchNotice(data.notice);
        }
      } else {
        setSearchResults([]);
        setSearchNotice(data.notice || 'No results found from search service.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchResults([]);
      setSearchNotice('Search service unavailable. Please add vendors manually.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Venues & Service Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Discover verified spaces, caterers, photographers, and entertainment, or log your own booked vendors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddCustomOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Custom Vendor</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchOnline()}
            placeholder="Search venues, caterers, bands, photographers, locations..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>

        <button
          onClick={handleSearchOnline}
          disabled={isSearching || !searchQuery.trim()}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
        >
          {isSearching ? (
            <>
              <Search className="w-3.5 h-3.5 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>Search Online</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-white text-stone-900 shadow-sm font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
        >
          <option value="all">All Prices</option>
          <option value="$">$ (Budget-Friendly)</option>
          <option value="$$">$$ (Moderate)</option>
          <option value="$$$">$$$ (Premium)</option>
          <option value="$$$$">$$$$ (Luxury)</option>
        </select>
      </div>

      {/* Search Results from SerpAPI */}
      {searchNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          {searchNotice}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Online Search Results
          </div>
          {searchResults.map((result, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm hover:border-stone-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-stone-900 hover:text-amber-700 transition-colors flex items-center gap-1"
                  >
                    {result.title}
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </a>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">{result.snippet}</p>
                  <div className="text-[10px] text-stone-400 mt-2">{result.source}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vendor Cards Grid */}
      {filteredVendors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="font-serif-display text-lg font-bold text-stone-800">
            No Vendors Matching Criteria
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search query, or add your own custom vendor contract.
          </p>
          <button
            onClick={() => setIsAddCustomOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800"
          >
            + Add Custom Vendor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Category & Pricing Strip */}
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="font-semibold text-stone-800">{vendor.category}</span>
                  <div className="flex items-center gap-1 font-semibold text-stone-700">
                    <span>{vendor.priceRange}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline mr-0.5" />
                      {vendor.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-serif-display text-lg font-bold text-stone-900 leading-snug">
                  {vendor.name}
                </h3>

                {/* Location & Capacity */}
                <div className="mt-1.5 space-y-1 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{vendor.location}</span>
                  </div>
                  {vendor.capacity && (
                    <div className="text-[11px] text-stone-500 pl-5">
                      {vendor.capacity}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-stone-600 line-clamp-3 mt-3 mb-4 leading-relaxed">
                  {vendor.description}
                </p>

                {/* Features list */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {vendor.features.slice(0, 3).map((f, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-stone-50 border border-stone-100 text-stone-700 px-2 py-0.5 rounded-md"
                    >
                      {f}
                    </span>
                  ))}
                  {vendor.features.length > 3 && (
                    <span className="text-[10px] text-stone-400 self-center">
                      +{vendor.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-stone-400 text-[11px]">Estimated Cost:</span>
                  <span className="font-bold text-stone-900">{vendor.estimatedCost}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${vendor.contactEmail}?subject=Inquiry regarding celebration planning`}
                    className="flex-1 py-1.5 text-center text-xs font-semibold rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    Contact
                  </a>

                  {event && (
                    <button
                      onClick={() => handleOpenBudgetModal(vendor)}
                      className="flex-1 py-1.5 text-center text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                    >
                      + Link to Budget
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link to Budget Modal */}
      {selectedVendorForBudget && event && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-serif-display text-lg font-bold text-stone-900">
              Link Vendor to {event.title}
            </h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Create an expense record in your event budget for {selectedVendorForBudget.name}.
            </p>

            <form onSubmit={handleConfirmLinkBudget} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Expense Line Item Title
                </label>
                <input
                  type="text"
                  required
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Budget Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={linkAmount}
                  onChange={(e) => setLinkAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  value={linkNotes}
                  onChange={(e) => setLinkNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVendorForBudget(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800"
                >
                  Confirm & Add to Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Vendor Modal */}
      {isAddCustomOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                Add Custom Vendor / Venue
              </h3>
              <button
                onClick={() => setIsAddCustomOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomVendor} className="p-6 space-y-4">
              {error && (
                <div className="p-2 text-xs rounded bg-red-50 border border-red-200 text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Vendor or Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pinecrest Country Club"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Service Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  >
                    <option value="Venue & Rental">Venue & Rental</option>
                    <option value="Catering & Bar">Catering & Bar</option>
                    <option value="Photography & Video">Photography & Video</option>
                    <option value="Music & Entertainment">Music & Entertainment</option>
                    <option value="Decor & Florals">Decor & Florals</option>
                    <option value="Invitations & Favors">Invitations & Favors</option>
                    <option value="Staff & Security">Staff & Security</option>
                    <option value="Transportation">Transportation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Price Tier
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
                  >
                    <option value="$">$ (Budget-Friendly)</option>
                    <option value="$$">$$ (Moderate)</option>
                    <option value="$$$">$$$ (Premium)</option>
                    <option value="$$$$">$$$$ (Luxury)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Estimated Cost / Quote
                  </label>
                  <input
                    type="text"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="e.g. $3,000 flat or $50/head"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Capacity (if Venue)
                  </label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 150 guests"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Location / Address
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, Springfield"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="booking@venue.com"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Description & Key Services
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about services provided, overtime rates, load-in requirements..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Key Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="Valet parking, BYOB license, Sound system, Covered patio"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCustomOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 shadow-sm"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
