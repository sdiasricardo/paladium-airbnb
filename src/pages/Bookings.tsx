import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking, Property } from '../types';
import { getBookingsByGuestId, cancelBooking } from '../db/bookingService';
import { getPropertyById } from '../db/propertyService';

interface BookingWithProperty extends Booking {
  property: Property | null;
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingBookingId, setCancelingBookingId] = useState<number | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const { currentUser } = useAuth();

  const fetchBookings = async () => {
    if (currentUser && currentUser.userType === 'guest') {
      try {
        const guestBookings = await getBookingsByGuestId(currentUser.id);
        
        // Fetch property details for each booking
        const bookingsWithProperties = await Promise.all(
          guestBookings.map(async (booking) => {
            const property = await getPropertyById(booking.propertyId);
            return {
              ...booking,
              property
            };
          })
        );
        
        setBookings(bookingsWithProperties);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!currentUser) return;
    
    setCancelingBookingId(bookingId);
    setCancelError('');
    
    try {
      const success = await cancelBooking(bookingId, currentUser.id);
      if (success) {
        setCancelSuccess(true);
        // Remove the canceled booking from the state
        setBookings(bookings.filter(booking => booking.id !== bookingId));
        setTimeout(() => setCancelSuccess(false), 3000);
      } else {
        setCancelError('Failed to cancel booking');
      }
    } catch (error) {
      setCancelError('An error occurred while canceling the booking');
    } finally {
      setCancelingBookingId(null);
    }
  };

  if (!currentUser || currentUser.userType !== 'guest') {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Access denied. Only guests can view this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-10">Loading your bookings...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      {cancelSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Booking canceled successfully.
        </div>
      )}

      {cancelError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {cancelError}
        </div>
      )}
      
      {bookings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">You don't have any bookings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src={booking.property?.images?.find(img => img.isPrimary)?.imageData || 
                         booking.property?.images?.[0]?.imageData || 
                         'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={booking.property?.title || 'Property'}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <h2 className="text-xl font-semibold mb-2">{booking.property?.title || 'Unknown Property'}</h2>
                  <p className="text-gray-600 mb-2">{booking.property?.location || 'Unknown Location'}</p>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div>
                      <span className="font-semibold">Check-in:</span> {new Date(booking.startDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-semibold">Check-out:</span> {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-semibold">Guests:</span> {booking.guestCount || 1}
                    </div>
                    <div>
                      <span className="font-semibold">Price:</span> ${booking.property?.price || 0}/night
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancelingBookingId === booking.id}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      {cancelingBookingId === booking.id ? 'Canceling...' : 'Cancel Booking'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;