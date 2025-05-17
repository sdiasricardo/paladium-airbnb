import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createProperty } from '../../db/propertyService';
import { MandatoryAmenities } from '../../types';

const AddProperty: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [amenities, setAmenities] = useState<MandatoryAmenities>({
    rooms: 1,
    bathrooms: 1,
    garageSpaces: 0,
    hasPool: false,
    hasBarbecue: false,
    isPetFriendly: false,
    hasAirConditioner: false,
    hasHeater: false,
    hasGym: false
  });
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAmenitiesChange = (field: keyof MandatoryAmenities, value: number | boolean) => {
    setAmenities(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser || currentUser.userType !== 'host') {
      setError('Only hosts can add properties');
      return;
    }

    if (!title || !description || !price || !location) {
      setError('Please fill in all required fields');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Please enter a valid price');
      return;
    }

    const property = await createProperty(
      currentUser.id,
      title,
      description,
      priceValue,
      location,
      imageUrl,
      amenities
    );

    if (property) {
      navigate('/host/properties');
    } else {
      setError('Failed to create property');
    }
  };

  if (!currentUser || currentUser.userType !== 'host') {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Access denied. Only hosts can view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Add New Property</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Property title"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Property description"
            rows={4}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="price">
            Price per night ($) *
          </label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Price per night"
            min="1"
            step="0.01"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="location">
            Location *
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Property location"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="imageUrl">
            Image URL
          </label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="URL to property image"
          />
        </div>
        
        <h3 className="text-lg font-semibold mb-4">Property Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="rooms">
              Number of Rooms *
            </label>
            <input
              id="rooms"
              type="number"
              value={amenities.rooms}
              onChange={(e) => handleAmenitiesChange('rooms', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="bathrooms">
              Number of Bathrooms *
            </label>
            <input
              id="bathrooms"
              type="number"
              value={amenities.bathrooms}
              onChange={(e) => handleAmenitiesChange('bathrooms', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="garageSpaces">
              Garage Spaces
            </label>
            <input
              id="garageSpaces"
              type="number"
              value={amenities.garageSpaces}
              onChange={(e) => handleAmenitiesChange('garageSpaces', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg"
              min="0"
            />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-4">Amenities</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center">
            <input
              id="hasPool"
              type="checkbox"
              checked={amenities.hasPool}
              onChange={(e) => handleAmenitiesChange('hasPool', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="hasPool">Swimming Pool</label>
          </div>
          
          <div className="flex items-center">
            <input
              id="hasBarbecue"
              type="checkbox"
              checked={amenities.hasBarbecue}
              onChange={(e) => handleAmenitiesChange('hasBarbecue', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="hasBarbecue">Barbecue Area</label>
          </div>
          
          <div className="flex items-center">
            <input
              id="isPetFriendly"
              type="checkbox"
              checked={amenities.isPetFriendly}
              onChange={(e) => handleAmenitiesChange('isPetFriendly', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isPetFriendly">Pet Friendly</label>
          </div>
          
          <div className="flex items-center">
            <input
              id="hasAirConditioner"
              type="checkbox"
              checked={amenities.hasAirConditioner}
              onChange={(e) => handleAmenitiesChange('hasAirConditioner', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="hasAirConditioner">Air Conditioner</label>
          </div>
          
          <div className="flex items-center">
            <input
              id="hasHeater"
              type="checkbox"
              checked={amenities.hasHeater}
              onChange={(e) => handleAmenitiesChange('hasHeater', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="hasHeater">Heater</label>
          </div>
          
          <div className="flex items-center">
            <input
              id="hasGym"
              type="checkbox"
              checked={amenities.hasGym}
              onChange={(e) => handleAmenitiesChange('hasGym', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="hasGym">Gym</label>
          </div>
        </div>
        
        <button
          type="submit"
          className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600"
        >
          Add Property
        </button>
      </form>
    </div>
  );
};

export default AddProperty;