import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Booking, Property } from '../../types';
import { getPropertyById } from '../../db/propertyService';
import { getBookingsByPropertyId } from '../../db/bookingService';
import { getUserById } from '../../db/userService';
import { useAuth } from '../../context/AuthContext';

interface BookingWithGuest extends Booking {
  guestName: string;
}

const PropertyBookings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [bookings, setBookings] = useState<BookingWithGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const propertyId = parseInt(id);
          const fetchedProperty = await getPropertyById(propertyId);
          
          if (fetchedProperty && currentUser && fetchedProperty.hostId === currentUser.id) {
            setProperty(fetchedProperty);
            
            // Get bookings for this property
            const propertyBookings = await getBookingsByPropertyId(propertyId);
            
            // Get guest details for each booking
            const bookingsWithGuests = await Promise.all(
              propertyBookings.map(async booking => {
                const guest = await getUserById(booking.guestId);
                return {
                  ...booking,
                  guestName: guest ? guest.username : 'Unknown Guest'
                };
              })
            );
            
            setBookings(bookingsWithGuests);
          }
        } catch (error) {
          console.error('Error fetching property bookings:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id, currentUser]);

  if (loading) {
    return <div className="text-center py-10">Loading bookings...</div>;
  }

  if (!property || !currentUser || property.hostId !== currentUser.id) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Access denied or property not found.</p>
        <Link to="/host/properties" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to My Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bookings for {property.title}</h1>
        <Link 
          to="/host/properties"
          className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
        >
          Back to My Properties
        </Link>
      </div>
      
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No bookings found for this property.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Guest</th>
                <th className="py-3 px-4 text-left">Check-in Date</th>
                <th className="py-3 px-4 text-left">Check-out Date</th>
                <th className="py-3 px-4 text-left">Duration</th>
                <th className="py-3 px-4 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => {
                const checkIn = new Date(booking.startDate);
                const checkOut = new Date(booking.endDate);
                const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                const total = property.price * nights;
                
                return (
                  <tr key={booking.id} className="border-t">
                    <td className="py-3 px-4">{booking.guestName}</td>
                    <td className="py-3 px-4">{new Date(booking.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{new Date(booking.endDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{nights} night{nights !== 1 ? 's' : ''}</td>
                    <td className="py-3 px-4">${total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PropertyBookings;