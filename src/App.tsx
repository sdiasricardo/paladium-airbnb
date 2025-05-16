import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetail from './pages/PropertyDetail';
import HostProperties from './pages/host/HostProperties';
import AddProperty from './pages/host/AddProperty';
import Bookings from './pages/Bookings';

// Protected route component
const ProtectedRoute = ({ children, userType }: { children: JSX.Element, userType?: 'guest' | 'host' }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (userType && currentUser.userType !== userType) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            
            {/* Protected routes for hosts */}
            <Route 
              path="/host/properties" 
              element={
                <ProtectedRoute userType="host">
                  <HostProperties />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/host/add-property" 
              element={
                <ProtectedRoute userType="host">
                  <AddProperty />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes for guests */}
            <Route 
              path="/bookings" 
              element={
                <ProtectedRoute userType="guest">
                  <Bookings />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;