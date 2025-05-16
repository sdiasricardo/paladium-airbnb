import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../../types';
import { getPropertiesByHostId } from '../../db/propertyService';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from '../../components/PropertyCard';

const HostProperties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.userType === 'host') {
      try {
        const hostProperties = getPropertiesByHostId(currentUser.id);
        setProperties(hostProperties);
      } catch (error) {
        console.error('Error fetching host properties:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [currentUser]);

  if (!currentUser || currentUser.userType !== 'host') {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Access denied. Only hosts can view this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-10">Loading your properties...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Properties</h1>
        <Link 
          to="/host/add-property"
          className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
        >
          Add New Property
        </Link>
      </div>
      
      {properties.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">You haven't added any properties yet.</p>
          <Link 
            to="/host/add-property"
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
          >
            Add Your First Property
          </Link>
        </div>
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

export default HostProperties;