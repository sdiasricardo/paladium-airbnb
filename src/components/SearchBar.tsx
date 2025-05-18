import React, { useState } from 'react';
import { PropertySearchFilters } from '../types';

interface SearchBarProps {
  onSearch: (searchTerm: string, filters: PropertySearchFilters) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PropertySearchFilters>({
    minPrice: undefined,
    maxPrice: undefined,
    guests: undefined,
    amenities: {
      rooms: undefined,
      bathrooms: undefined,
      hasPool: undefined,
      hasBarbecue: undefined,
      isPetFriendly: undefined,
      hasAirConditioner: undefined,
      hasHeater: undefined,
      hasGym: undefined
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, filters);
  };

  const handleFilterChange = (category: keyof PropertySearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleAmenityChange = (amenity: string, value: boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: value
      }
    }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: undefined,
      maxPrice: undefined,
      guests: undefined,
      amenities: {
        rooms: undefined,
        bathrooms: undefined,
        hasPool: undefined,
        hasBarbecue: undefined,
        isPetFriendly: undefined,
        hasAirConditioner: undefined,
        hasHeater: undefined,
        hasGym: undefined
      }
    });
  };

  return (
    <div className="w-full mb-8">
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by location, description..."
            className="flex-grow p-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="p-4 border rounded-md bg-white shadow-md">
            <h3 className="font-semibold mb-3">Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm mb-1">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full p-2 border rounded-md"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full p-2 border rounded-md"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Number of Guests</label>
                <input
                  type="number"
                  placeholder="Guests"
                  className="w-full p-2 border rounded-md"
                  value={filters.guests || ''}
                  onChange={(e) => handleFilterChange('guests', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Rooms</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Min rooms"
                  className="w-full p-2 border rounded-md"
                  value={filters.amenities?.rooms || ''}
                  onChange={(e) => handleAmenityChange('rooms', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Bathrooms</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Min bathrooms"
                  className="w-full p-2 border rounded-md"
                  value={filters.amenities?.bathrooms || ''}
                  onChange={(e) => handleAmenityChange('bathrooms', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.amenities?.hasPool === true}
                    onChange={(e) => handleAmenityChange('hasPool', e.target.checked ? true : undefined)}
                    className="mr-2"
                  />
                  Pool
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.amenities?.hasBarbecue === true}
                    onChange={(e) => handleAmenityChange('hasBarbecue', e.target.checked ? true : undefined)}
                    className="mr-2"
                  />
                  Barbecue
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.amenities?.isPetFriendly === true}
                    onChange={(e) => handleAmenityChange('isPetFriendly', e.target.checked ? true : undefined)}
                    className="mr-2"
                  />
                  Pet Friendly
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.amenities?.hasAirConditioner === true}
                    onChange={(e) => handleAmenityChange('hasAirConditioner', e.target.checked ? true : undefined)}
                    className="mr-2"
                  />
                  Air Conditioner
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.amenities?.hasHeater === true}
                    onChange={(e) => handleAmenityChange('hasHeater', e.target.checked ? true : undefined)}
                    className="mr-2"
                  />
                  Heater
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.amenities?.hasGym === true}
                    onChange={(e) => handleAmenityChange('hasGym', e.target.checked ? true : undefined)}
                    className="mr-2"
                  />
                  Gym
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;