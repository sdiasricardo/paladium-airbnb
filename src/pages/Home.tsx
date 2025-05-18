import React, { useEffect, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import SearchBar from '../components/SearchBar';
import { Property, PropertySearchFilters } from '../types';
import { getAllProperties, searchProperties } from '../db/propertyService';

const Home: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const allProperties = await getAllProperties();
        setProperties(allProperties);
        setFilteredProperties(allProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleSearch = async (searchTerm: string, filters: PropertySearchFilters) => {
    setLoading(true);
    setSearchPerformed(true);
    
    try {
      const results = await searchProperties(searchTerm, filters);
      setFilteredProperties(results);
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading properties...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Available Properties</h1>
      
      <SearchBar onSearch={handleSearch} />
      
      {filteredProperties.length === 0 ? (
        <p className="text-gray-600">
          {searchPerformed 
            ? "No properties match your search criteria." 
            : "No properties available at the moment."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;