import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Property } from '../types';
import { getPropertyById } from '../db/propertyService';
import { createBooking, isPropertyAvailable } from '../db/bookingService';
import { useAuth } from '../context/AuthContext';
import BookingCalendar from '../components/BookingCalendar';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

    const available = await isPropertyAvailable(property.id, startDate, endDate);
    if (!available) {
      setBookingError('Property is not available for the selected dates');
      return;
    }

    const booking = await createBooking(property.id, currentUser.id, startDate, endDate);
    if (booking) {
      setBookingSuccess(true);
      setStartDate('');
      setEndDate('');
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <img 
          src={property.imageUrl || 'https://via.placeholder.com/800x400?text=No+Image'} 
          alt={property.title}
          className="w-full h-96 object-cover"
        />
        
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
          <p className="text-gray-600 mb-4">{property.location}</p>
          <p className="text-xl font-bold text-red-500 mb-4">${property.price} / night</p>
          
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{property.description}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
              <div className="flex items-center">
                <span className="font-medium">{property.amenities.rooms} {property.amenities.rooms === 1 ? 'Room' : 'Rooms'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">{property.amenities.bathrooms} {property.amenities.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
              </div>
              {property.amenities.garageSpaces > 0 && (
                <div className="flex items-center">
                  <span className="font-medium">{property.amenities.garageSpaces} {property.amenities.garageSpaces === 1 ? 'Garage Space' : 'Garage Spaces'}</span>
                </div>
              )}
              {property.amenities.hasPool && (
                <div className="flex items-center">
                  <span>Swimming Pool</span>
                </div>
              )}
              {property.amenities.hasBarbecue && (
                <div className="flex items-center">
                  <span>Barbecue Area</span>
                </div>
              )}
              {property.amenities.isPetFriendly && (
                <div className="flex items-center">
                  <span>Pet Friendly</span>
                </div>
              )}
              {property.amenities.hasAirConditioner && (
                <div className="flex items-center">
                  <span>Air Conditioner</span>
                </div>
              )}
              {property.amenities.hasHeater && (
                <div className="flex items-center">
                  <span>Heater</span>
                </div>
              )}
              {property.amenities.hasGym && (
                <div className="flex items-center">
                  <span>Gym</span>
                </div>
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