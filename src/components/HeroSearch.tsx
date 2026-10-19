import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, MapPin, Building2, Coins } from 'lucide-react';
import { District, AdministrativeUnit } from '../types';
import { api } from '../services/api';

interface HeroSearchProps {
  onSearch: (filters: {
    districtId?: string;
    administrativeUnitId?: string;
    minPriceUgx?: number;
    maxPriceUgx?: number;
    category?: string;
  }) => void;
  initialDistrictId?: string;
  initialSubcountyId?: string;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  initialDistrictId = '',
  initialSubcountyId = '',
}) => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [subcounties, setSubcounties] = useState<AdministrativeUnit[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDistrictId);
  const [selectedSubcountyId, setSelectedSubcountyId] = useState<string>(initialSubcountyId);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('all');
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubcounties, setLoadingSubcounties] = useState(false);

  // Load active districts
  useEffect(() => {
    let mounted = true;
    setLoadingDistricts(true);
    api.getDistricts()
      .then((data) => {
        if (mounted) {
          // Sort alphabetically
          setDistricts(data.sort((a, b) => a.name.localeCompare(b.name)));
        }
      })
      .catch((err) => console.error('Failed to load districts:', err))
      .finally(() => {
        if (mounted) setLoadingDistricts(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // When selected district changes, load subcounties or clear if none
  useEffect(() => {
    if (!selectedDistrictId) {
      setSubcounties([]);
      setSelectedSubcountyId('');
      return;
    }

    let mounted = true;
    setLoadingSubcounties(true);
    api.getSubcounties(selectedDistrictId)
      .then((data) => {
        if (mounted) {
          setSubcounties(data.sort((a, b) => a.name.localeCompare(b.name)));
          // If current subcounty selection doesn't belong to this district, reset it
          if (!data.some((u) => u.id === selectedSubcountyId)) {
            setSelectedSubcountyId('');
          }
        }
      })
      .catch((err) => console.error('Failed to load subcounties:', err))
      .finally(() => {
        if (mounted) setLoadingSubcounties(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedDistrictId]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrictId = e.target.value;
    setSelectedDistrictId(newDistrictId);
    setSelectedSubcountyId(''); // Clear incompatible subcounty immediately
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const min = minPrice ? parseInt(minPrice.replace(/[^0-9]/g, ''), 10) : undefined;
    const max = maxPrice ? parseInt(maxPrice.replace(/[^0-9]/g, ''), 10) : undefined;

    onSearch({
      districtId: selectedDistrictId || undefined,
      administrativeUnitId: selectedSubcountyId || undefined,
      minPriceUgx: min && !isNaN(min) ? min : undefined,
      maxPriceUgx: max && !isNaN(max) ? max : undefined,
      category: category !== 'all' ? category : undefined,
    });
  };

  const handleClear = () => {
    setSelectedDistrictId('');
    setSelectedSubcountyId('');
    setMinPrice('');
    setMaxPrice('');
    setCategory('all');
    onSearch({});
  };

  const hasActiveFilters = Boolean(
    selectedDistrictId || selectedSubcountyId || minPrice || maxPrice || category !== 'all'
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-xl border border-neutral-200/80 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* District Selector */}
          <div>
            <label htmlFor="hero-district-select" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-800" />
              <span>District</span>
            </label>
            <select
              id="hero-district-select"
              value={selectedDistrictId}
              onChange={handleDistrictChange}
              disabled={loadingDistricts}
              className="w-full text-xs md:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all disabled:opacity-50"
            >
              <option value="">All Uganda Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.region})
                </option>
              ))}
            </select>
          </div>

          {/* Subcounty / Administrative Unit Selector */}
          <div>
            <label htmlFor="hero-subcounty-select" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-800" />
              <span>Subcounty / Division</span>
            </label>
            <select
              id="hero-subcounty-select"
              value={selectedSubcountyId}
              onChange={(e) => setSelectedSubcountyId(e.target.value)}
              disabled={!selectedDistrictId || loadingSubcounties}
              className="w-full text-xs md:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all disabled:opacity-50 disabled:bg-neutral-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!selectedDistrictId
                  ? 'Select District First'
                  : loadingSubcounties
                  ? 'Loading subcounties...'
                  : 'All Subcounties'}
              </option>
              {subcounties.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.unitType})
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Price (UGX) */}
          <div>
            <label htmlFor="hero-min-price" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-800" />
              <span>Min Price (UGX)</span>
            </label>
            <input
              id="hero-min-price"
              type="number"
              min="0"
              step="5000000"
              placeholder="e.g. 20,000,000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full text-xs md:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
            />
          </div>

          {/* Maximum Price (UGX) */}
          <div>
            <label htmlFor="hero-max-price" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-800" />
              <span>Max Price (UGX)</span>
            </label>
            <input
              id="hero-max-price"
              type="number"
              min="0"
              step="5000000"
              placeholder="e.g. 100,000,000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs md:text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Action Controls & Clear Filters */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100">
          <div className="flex items-center gap-2 text-xs text-neutral-500 w-full sm:w-auto">
            <span>Filter across all 136 districts of Uganda</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs md:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-all shadow-sm whitespace-nowrap w-full sm:w-auto"
            >
              <Search className="w-4 h-4" />
              <span>Search Available Land</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
