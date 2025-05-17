import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-red-500">AirbnbClone</Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-red-500">Home</Link>
          
          {currentUser && (
            <>
              {currentUser.userType === 'host' && (
                <>
                  <Link to="/host/dashboard" className="hover:text-red-500">Dashboard</Link>
                  <Link to="/host/properties" className="hover:text-red-500">My Properties</Link>
                </>
              )}
              
              {currentUser.userType === 'guest' && (
                <Link to="/bookings" className="hover:text-red-500">My Bookings</Link>
              )}
              
              <div className="h-6 border-l-2 border-red-500 mx-2"></div>
              
              <span className="text-gray-600">Welcome, {currentUser.username}</span>
              <button 
                onClick={logout}
                className="hover:text-red-500"
              >
                Logout
              </button>
            </>
          )}
          
          {!currentUser && (
            <>
              <Link to="/login" className="hover:text-red-500">Login</Link>
              <Link to="/register" className="hover:text-red-500">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;