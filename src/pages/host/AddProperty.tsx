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
  const [hideFullAddress, setHideFullAddress] = useState(false);
  const [visibleLocation, setVisibleLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [maxGuests, setMaxGuests] = useState(1);
  const [mandatoryAmenities, setMandatoryAmenities] = useState<MandatoryAmenities>({
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
  const [additionalAmenities, setAdditionalAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAmenitiesChange = (field: keyof MandatoryAmenities, value: number | boolean) => {
    setMandatoryAmenities(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() !== '') {
      setAdditionalAmenities([...additionalAmenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setAdditionalAmenities(additionalAmenities.filter((_, i) => i !== index));
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

    if (hideFullAddress && !visibleLocation) {
      setError('Please provide a visible location');
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
      hideFullAddress ? visibleLocation : location,
      hideFullAddress,
      imageUrl,
      maxGuests,
      mandatoryAmenities,
      additionalAmenities
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
          <label className="block text-gray-700 mb-2" htmlFor="maxGuests">
            Maximum Guests *
          </label>
          <input
            id="maxGuests"
            type="number"
            value={maxGuests}
            onChange={(e) => setMaxGuests(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Maximum number of guests"
            min="1"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="location">
            Full Address *
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Full property address"
            required
          />
        </div>
        
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              id="hideFullAddress"
              type="checkbox"
              checked={hideFullAddress}
              onChange={(e) => setHideFullAddress(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="hideFullAddress" className="text-gray-700">
              Hide full address from guests
            </label>
          </div>
          
          {hideFullAddress && (
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="visibleLocation">
                Visible Location (shown to guests) *
              </label>
              <input
                id="visibleLocation"
                type="text"
                value={visibleLocation}
                onChange={(e) => setVisibleLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g. Downtown, Near Central Park, etc."
                required={hideFullAddress}
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter a general area or neighborhood that will be shown to guests instead of the full address.
              </p>
            </div>
          )}
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
              value={mandatoryAmenities.rooms}
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
              value={mandatoryAmenities.bathrooms}
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
              value={mandatoryAmenities.garageSpaces}
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
              checked={mandatoryAmenities.hasPool}
              onChange={(e) => handleAmenitiesChange('hasPool', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="hasPool">Swimming Pool</label>
          </div>
          
          <div className="flex items-center">
            <input
              id="hasBarbecue"
              type="checkbox"
              checked={mandatoryAmenities.hasBarbecue}
              onChange={(e) => handleAmenitiesChange('hasBarbecue', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="hasBarbecue">Barbecue Area</label>
          </div>
          
          <div className="flex items-center">
            <input
              id="isPetFriendly"
              type="checkbox"
              checked={mandatoryAmenities.isPetFriendly}
              onChange={(e) => handleAmenitiesChange('isPetFriendly', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isPetFriendly">Pet Friendly</label>
          </div>
          
          <div className="flex items-center">
            <input
              id="hasAirConditioner"
              type="checkbox"
              checked={mandatoryAmenities.hasAirConditioner}
              onChange={(e) => handleAmenitiesChange('hasAirConditioner', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="hasAirConditioner">Air Conditioner</label>
          </div>
          
          <div className="flex items-center">
            <input
              id="hasHeater"
              type="checkbox"
              checked={mandatoryAmenities.hasHeater}
              onChange={(e) => handleAmenitiesChange('hasHeater', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="hasHeater">Heater</label>
          </div>
          
          <div className="flex items-center">
            <input
              id="hasGym"
              type="checkbox"
              checked={mandatoryAmenities.hasGym}
              onChange={(e) => handleAmenitiesChange('hasGym', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="hasGym">Gym</label>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-4">Additional Amenities</h3>
        <div className="mb-6">
          <div className="flex mb-2">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              className="flex-grow px-3 py-2 border rounded-l-lg"
              placeholder="Add another amenity"
            />
            <button
              type="button"
              onClick={addAmenity}
              className="bg-red-500 text-white px-4 py-2 rounded-r-lg hover:bg-red-600"
            >
              Add
            </button>
          </div>
          
          {additionalAmenities.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Added amenities:</p>
              <div className="flex flex-wrap gap-2">
                {additionalAmenities.map((amenity, index) => (
                  <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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