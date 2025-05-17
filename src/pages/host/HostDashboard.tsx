import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPropertiesByHostId } from '../../db/propertyService';
import { getBookingsByHostId } from '../../db/bookingService';
import { Property, Booking } from '../../types';

interface BookingSummary {
  totalBookings: number;
  upcomingBookings: number;
  totalRevenue: number;
}

const HostDashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary>({
    totalBookings: 0,
    upcomingBookings: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser && currentUser.userType === 'host') {
        try {
          // Get host properties
          const hostProperties = await getPropertiesByHostId(currentUser.id);
          setProperties(hostProperties);
          
          // Get all bookings for this host
          const hostBookings = await getBookingsByHostId(currentUser.id);
          
          // Calculate booking statistics
          const today = new Date();
          const upcomingBookings = hostBookings.filter(booking => 
            new Date(booking.startDate) >= today
          ).length;
          
          // Calculate total revenue
          let totalRevenue = 0;
          hostBookings.forEach(booking => {
            const property = hostProperties.find(p => p.id === booking.propertyId);
            if (property) {
              const checkIn = new Date(booking.startDate);
              const checkOut = new Date(booking.endDate);
              const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
              totalRevenue += property.price * nights;
            }
          });
          
          setBookingSummary({
            totalBookings: hostBookings.length,
            upcomingBookings,
            totalRevenue
          });
        } catch (error) {
          console.error('Error fetching host data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [currentUser]);

  if (!currentUser || currentUser.userType !== 'host') {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Access denied. Only hosts can view this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Host Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Total Properties</h2>
          <p className="text-3xl font-bold text-blue-600">{properties.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Upcoming Bookings</h2>
          <p className="text-3xl font-bold text-green-600">{bookingSummary.upcomingBookings}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-red-600">${bookingSummary.totalRevenue.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Properties</h2>
            <Link 
              to="/host/add-property"
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
            >
              Add New Property
            </Link>
          </div>
        </div>
        
        {properties.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-4">You haven't added any properties yet.</p>
            <Link 
              to="/host/add-property"
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
            >
              Add Your First Property
            </Link>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Property</th>
                <th className="py-3 px-4 text-left">Location</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(property => (
                <tr key={property.id} className="border-t">
                  <td className="py-3 px-4 font-medium">{property.title}</td>
                  <td className="py-3 px-4">{property.location}</td>
                  <td className="py-3 px-4">${property.price}/night</td>
                  <td className="py-3 px-4">
                    <Link 
                      to={`/property/${property.id}`}
                      className="text-blue-500 hover:underline mr-4"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/host/property/${property.id}/bookings`}
                      className="text-green-500 hover:underline"
                    >
                      Bookings
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;