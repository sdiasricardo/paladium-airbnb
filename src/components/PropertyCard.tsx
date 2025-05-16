import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md">
      <img 
        src={property.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
        alt={property.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
        <p className="text-gray-600 mb-2">{property.location}</p>
        <p className="text-gray-800 font-bold">${property.price} / night</p>
        <Link 
          to={`/property/${property.id}`}
          className="mt-3 inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;