import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  MapPin, 
  Building2, 
  Coins, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown,
  Layers,
  HelpCircle,
  Compass
} from 'lucide-react';
import { LandListing, District, AdministrativeUnit, SearchFilters, LandUseCategory } from '../types';
import { ListingCard } from '../components/ListingCard';
import { api } from '../services/api';
import { formatUgx } from '../utils/formatters';

interface CatalogPageProps {
  initialFilters?: SearchFilters;
  onSelectListing: (listing: LandListing) => void;
  onInquireWhatsApp?: (listing: LandListing) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  initialFilters = {},
  onSelectListing,
  onInquireWhatsApp,
}) => {
  const [listings, setListings] = useState<LandListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Geography state
  const [districts, setDistricts] = useState<District[]>([]);
  const [subcounties, setSubcounties] = useState<AdministrativeUnit[]>([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  const [selectedDistrictId, setSelectedDistrictId] = useState(initialFilters.districtId || '');
  const [selectedSubcountyId, setSelectedSubcountyId] = useState(initialFilters.administrativeUnitId || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters.category || 'all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>(initialFilters.availability || 'all');
  const [minPrice, setMinPrice] = useState<string>(initialFilters.minPriceUgx ? String(initialFilters.minPriceUgx) : '');
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters.maxPriceUgx ? String(initialFilters.maxPriceUgx) : '');
  const [sortBy, setSortBy] = useState<SearchFilters['sortBy']>(initialFilters.sortBy || 'newest');

  // Load districts
  useEffect(() => {
    api.getDistricts()
      .then((data) => setDistricts(data.sort((a, b) => a.name.localeCompare(b.name))))
      .catch((err) => console.error(err));
  }, []);

  // Cascading subcounties
  useEffect(() => {
    if (!selectedDistrictId) {
      setSubcounties([]);
      setSelectedSubcountyId('');
      return;
    }

    api.getSubcounties(selectedDistrictId)
      .then((data) => {
        setSubcounties(data.sort((a, b) => a.name.localeCompare(b.name)));
        if (!data.some((u) => u.id === selectedSubcountyId)) {
          setSelectedSubcountyId('');
        }
      })
      .catch((err) => console.error(err));
  }, [selectedDistrictId]);

  // Fetch listings based on current filters
  const fetchListings = () => {
    setLoading(true);

    const min = minPrice ? parseInt(minPrice.replace(/[^0-9]/g, ''), 10) : undefined;
    const max = maxPrice ? parseInt(maxPrice.replace(/[^0-9]/g, ''), 10) : undefined;

    const filters: SearchFilters = {
      query: searchQuery.trim() || undefined,
      districtId: selectedDistrictId || undefined,
      administrativeUnitId: selectedSubcountyId || undefined,
      category: selectedCategory !== 'all' ? (selectedCategory as LandUseCategory) : undefined,
      availability: selectedAvailability !== 'all' ? (selectedAvailability as any) : undefined,
      minPriceUgx: min && !isNaN(min) ? min : undefined,
      maxPriceUgx: max && !isNaN(max) ? max : undefined,
      sortBy,
    };

    api.getListings(filters)
      .then((res) => {
        setListings(res.listings);
        setTotalCount(res.total);
      })
      .catch((err) => console.error('Failed to load listings:', err))
      .finally(() => setLoading(false));
  };

  // Trigger search on filter changes
  useEffect(() => {
    fetchListings();
  }, [
    selectedDistrictId,
    selectedSubcountyId,
    selectedCategory,
    selectedAvailability,
    sortBy,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDistrictId('');
    setSelectedSubcountyId('');
    setSelectedCategory('all');
    setSelectedAvailability('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');

    api.getListings({})
      .then((res) => {
        setListings(res.listings);
        setTotalCount(res.total);
      })
      .catch((err) => console.error(err));
  };

  const currentDistrict = districts.find((d) => d.id === selectedDistrictId);
  const currentSubcounty = subcounties.find((u) => u.id === selectedSubcountyId);

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedDistrictId ||
    selectedSubcountyId ||
    selectedCategory !== 'all' ||
    selectedAvailability !== 'all' ||
    minPrice ||
    maxPrice
  );

  return (
    <div className="space-y-10 pb-16">
      {/* 1. DEDICATED HERO SECTION FOR CATALOG */}
      <section className="relative min-h-[320px] sm:min-h-[380px] flex items-center justify-center bg-neutral-900 text-white overflow-hidden px-4 sm:px-6 lg:px-8 py-16">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero_catalog_uganda_1792431441419.jpg"
            alt="Surveyed Ugandan parcels and green countryside"
            className="w-full h-full object-cover object-center brightness-100 contrast-105"
          />
          {/* Reduced darkness overlay for bright, visible Ugandan parcels */}
          <div className="absolute inset-0 bg-neutral-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/25 to-neutral-950/35" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-neutral-950/60 backdrop-blur-sm border border-emerald-500/40 text-xs sm:text-sm font-semibold tracking-widest uppercase text-emerald-300 shadow-sm">
            Uganda Land Catalog · GL Real Estates
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
            Available Land & Plots for Sale
          </h1>
          <p className="text-xs sm:text-base text-neutral-100 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Search, filter, and inspect verified surveyed plots across all 136 districts of Uganda. Each listing features 3 verified photographs, a video tour, and direct WhatsApp booking.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-neutral-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Residential, Commercial & Agricultural</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Verified Survey Beacons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Guided Site Visits</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CATALOG BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Filter and Search Bar Container */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Top Row: Search input + District + Subcounty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search Query */}
              <div>
                <label htmlFor="catalog-query-input" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Search Keywords / Ref</span>
                </label>
                <div className="relative">
                  <input
                    id="catalog-query-input"
                    type="text"
                    placeholder="e.g. Kira, Seeta, GL-0001, 50 decimals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg pl-3 pr-8 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        fetchListings();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* District Cascader */}
              <div>
                <label htmlFor="catalog-district-select" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                  <span>District (All 136)</span>
                </label>
                <select
                  id="catalog-district-select"
                  value={selectedDistrictId}
                  onChange={(e) => {
                    setSelectedDistrictId(e.target.value);
                    setSelectedSubcountyId('');
                  }}
                  className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value="">All Uganda Districts</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcounty Selector */}
              <div>
                <label htmlFor="catalog-subcounty-select" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Subcounty / Division</span>
                </label>
                <select
                  id="catalog-subcounty-select"
                  value={selectedSubcountyId}
                  onChange={(e) => setSelectedSubcountyId(e.target.value)}
                  disabled={!selectedDistrictId}
                  className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white disabled:opacity-50 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedDistrictId
                      ? 'Select a District First'
                      : 'All Subcounties in this District'}
                  </option>
                  {subcounties.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.unitType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Secondary Row: Category, Price Range, Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div>
                <label htmlFor="catalog-category-select" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Land-Use Category
                </label>
                <select
                  id="catalog-category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Commercial Land">Commercial Land</option>
                  <option value="Agricultural Land">Agricultural Land</option>
                  <option value="Mixed-Use Land">Mixed-Use Land</option>
                  <option value="Industrial Land">Industrial Land</option>
                </select>
              </div>

              <div>
                <label htmlFor="catalog-min-price" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Min Price (UGX)
                </label>
                <input
                  id="catalog-min-price"
                  type="number"
                  min="0"
                  step="5000000"
                  placeholder="Min UGX"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="catalog-max-price" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Max Price (UGX)
                </label>
                <input
                  id="catalog-max-price"
                  type="number"
                  min="0"
                  step="5000000"
                  placeholder="Max UGX"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="catalog-availability-select" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Availability Status
                </label>
                <select
                  id="catalog-availability-select"
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value="all">All (Available & Reserved)</option>
                  <option value="available">Available for Purchase</option>
                  <option value="reserved">Reserved Plots</option>
                  <option value="sold">Sold Archive</option>
                </select>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-sm"
                >
                  Apply Search Filters
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All</span>
                  </button>
                )}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                <label htmlFor="catalog-sort-select" className="font-medium">Sort by:</label>
                <select
                  id="catalog-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="size_desc">Largest Land Size</option>
                </select>
              </div>
            </div>
          </form>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">Active filters:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-md">
                  Keyword: "{searchQuery}"
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      fetchListings();
                    }}
                    className="hover:text-red-600"
                    aria-label="Remove keyword filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {currentDistrict && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-md">
                  District: {currentDistrict.name}
                  <button
                    onClick={() => {
                      setSelectedDistrictId('');
                      setSelectedSubcountyId('');
                    }}
                    className="hover:text-red-600"
                    aria-label="Remove district filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {currentSubcounty && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-md">
                  Subcounty: {currentSubcounty.name}
                  <button
                    onClick={() => setSelectedSubcountyId('')}
                    className="hover:text-red-600"
                    aria-label="Remove subcounty filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-md">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="hover:text-red-600"
                    aria-label="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-md">
                  Budget: {minPrice ? formatUgx(Number(minPrice)) : '0'} –{' '}
                  {maxPrice ? formatUgx(Number(maxPrice)) : 'Any'}
                  <button
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                      fetchListings();
                    }}
                    className="hover:text-red-600"
                    aria-label="Remove budget filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Header: Count & Loading State */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-600">
          <span className="font-medium">
            {loading ? (
              'Searching land records...'
            ) : (
              `Showing ${listings.length} ${listings.length === 1 ? 'plot' : 'plots'} matching your criteria`
            )}
          </span>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-neutral-200 rounded-xl h-96 w-full" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSelect={onSelectListing}
                onInquireWhatsApp={onInquireWhatsApp}
              />
            ))}
          </div>
        ) : (
          /* Empty Results State */
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-neutral-900">
                No Plots Match Your Exact Criteria
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                We couldn't find any listings matching all of your selected filters. Try broadening your price range, choosing another district, or resetting the filters.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors"
              >
                Reset Filters & Show All Land
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
