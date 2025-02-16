import { Navigate } from 'react-router-dom';

// Protección de rutas con verificación de TOKEN JWT

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
