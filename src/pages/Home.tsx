import React, { useEffect, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import { Property } from '../types';
import { getAllProperties } from '../db/propertyService';

const Home: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = () => {
      try {
        const allProperties = getAllProperties();
        setProperties(allProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading properties...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Available Properties</h1>
      
      {properties.length === 0 ? (
        <p className="text-gray-600">No properties available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;