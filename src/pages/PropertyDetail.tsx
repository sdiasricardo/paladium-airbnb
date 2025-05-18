import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Property, PropertyImage } from '../types';
import { getPropertyById } from '../db/propertyService';
import { createBooking, isPropertyAvailable } from '../db/bookingService';
import { useAuth } from '../context/AuthContext';
import BookingCalendar from '../components/BookingCalendar';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        try {
          const fetchedProperty = await getPropertyById(parseInt(id));
          setProperty(fetchedProperty);
          
          // Set the primary image or first image as selected
          if (fetchedProperty?.images && fetchedProperty.images.length > 0) {
            const primaryImage = fetchedProperty.images.find(img => img.isPrimary);
            setSelectedImage(primaryImage || fetchedProperty.images[0]);
          }
        } catch (error) {
          console.error('Error fetching property:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProperty();
  }, [id]);

  const handleBooking = async () => {
    setBookingError('');
    setBookingSuccess(false);

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.userType !== 'guest') {
      setBookingError('Only guests can book properties');
      return;
    }

    if (!startDate || !endDate) {
      setBookingError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setBookingError('End date must be after start date');
      return;
    }

    if (!property) return;

    if (guestCount > property.maxGuests) {
      setBookingError(`This property can only accommodate up to ${property.maxGuests} guests`);
      return;
    }

    const available = await isPropertyAvailable(property.id, startDate, endDate);
    if (!available) {
      setBookingError('Property is not available for the selected dates');
      return;
    }

    const booking = await createBooking(property.id, currentUser.id, startDate, endDate, guestCount);
    if (booking) {
      setBookingSuccess(true);
      setStartDate('');
      setEndDate('');
      setGuestCount(1);
    } else {
      setBookingError('Failed to create booking');
    }
  };

  const handleDateRangeSelect = (start: Date | null, end: Date | null) => {
    setStartDate(start ? start.toISOString().split('T')[0] : '');
    setEndDate(end ? end.toISOString().split('T')[0] : '');
  };

  if (loading) {
    return <div className="text-center py-10">Loading property details...</div>;
  }

  if (!property) {
    return <div className="text-center py-10">Property not found</div>;
  }

  // Determine which location to display
  const displayLocation = property.hideFullAddress ? property.visibleLocation : property.location;
  const isPropertyOwner = currentUser && currentUser.userType === 'host' && property.hostId === currentUser.id;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <div className="relative">
            <div className="w-full h-96 overflow-hidden">
              <img 
                src={selectedImage?.imageData || property.images.find(img => img.isPrimary)?.imageData || property.images[0].imageData} 
                alt={property.title}
                className="w-full h-96 object-cover"
              />
            </div>
            {property.images.length > 1 && (
              <div className="flex overflow-x-auto gap-2 p-2 bg-gray-100">
                {property.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image.imageData} 
                    alt={`${property.title} - image ${index + 1}`}
                    className={`h-20 w-32 object-cover cursor-pointer rounded ${selectedImage?.id === image.id ? 'ring-2 ring-red-500' : ''}`}
                    onClick={() => setSelectedImage(image)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <img 
            src="https://via.placeholder.com/800x400?text=No+Image" 
            alt={property.title}
            className="w-full h-96 object-cover"
          />
        )}
        
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
          <div className="mb-4">
            <p className="text-gray-600">{displayLocation}</p>
            {isPropertyOwner && property.hideFullAddress && (
              <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Full address (only visible to you):</span> {property.location}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Address shown to guests:</span> {property.visibleLocation}
                </p>
              </div>
            )}
          </div>
          <p className="text-xl font-bold text-red-500 mb-4">${property.price} / night</p>
          
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{property.description}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
              <div className="flex items-center">
                <span className="font-medium">{property.mandatoryAmenities.rooms} {property.mandatoryAmenities.rooms === 1 ? 'Room' : 'Rooms'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">{property.mandatoryAmenities.bathrooms} {property.mandatoryAmenities.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">{property.maxGuests} {property.maxGuests === 1 ? 'Guest' : 'Guests'} maximum</span>
              </div>
              {property.mandatoryAmenities.garageSpaces > 0 && (
                <div className="flex items-center">
                  <span className="font-medium">{property.mandatoryAmenities.garageSpaces} {property.mandatoryAmenities.garageSpaces === 1 ? 'Garage Space' : 'Garage Spaces'}</span>
                </div>
              )}
              {property.mandatoryAmenities.hasPool && (
                <div className="flex items-center">
                  <span>Swimming Pool</span>
                </div>
              )}
              {property.mandatoryAmenities.hasBarbecue && (
                <div className="flex items-center">
                  <span>Barbecue Area</span>
                </div>
              )}
              {property.mandatoryAmenities.isPetFriendly && (
                <div className="flex items-center">
                  <span>Pet Friendly</span>
                </div>
              )}
              {property.mandatoryAmenities.hasAirConditioner && (
                <div className="flex items-center">
                  <span>Air Conditioner</span>
                </div>
              )}
              {property.mandatoryAmenities.hasHeater && (
                <div className="flex items-center">
                  <span>Heater</span>
                </div>
              )}
              {property.mandatoryAmenities.hasGym && (
                <div className="flex items-center">
                  <span>Gym</span>
                </div>
              )}
              
              {property.additionalAmenities && property.additionalAmenities.length > 0 && (
                <>
                  <div className="col-span-2 md:col-span-3 mt-4 mb-2">
                    <h3 className="font-medium">Additional Amenities:</h3>
                  </div>
                  {property.additionalAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <span>{amenity}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          
          {currentUser && currentUser.userType === 'guest' && (
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-xl font-semibold mb-4">Book this property</h2>
              
              {bookingSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  Booking successful! The property is now reserved for your selected dates.
                </div>
              )}
              
              {bookingError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {bookingError}
                </div>
              )}
              
              <BookingCalendar 
                propertyId={property.id} 
                onDateRangeSelect={handleDateRangeSelect} 
              />
              
              <div className="mb-4 mt-4">
                <label className="block text-gray-700 mb-2" htmlFor="guestCount">
                  Number of Guests *
                </label>
                <input
                  id="guestCount"
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                  max={property.maxGuests}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum {property.maxGuests} {property.maxGuests === 1 ? 'guest' : 'guests'}
                </p>
              </div>
              
              <button
                onClick={handleBooking}
                className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 mt-4"
              >
                Book Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;