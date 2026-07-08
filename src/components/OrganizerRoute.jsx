import React from 'react';
import { Navigate } from 'react-router-dom';

const OrganizerRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  
  if (userRole !== 'organizer') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default OrganizerRoute;
