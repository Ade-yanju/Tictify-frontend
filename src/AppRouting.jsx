import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import OrganizerRoute from './components/OrganizerRoute';

// Landing & Auth
import Landing from './pages/Landing';
import RegisterAs from './pages/user/Auth/RegisterAs';
import Register from './pages/user/Auth/Register';
import Login from './pages/user/Auth/Login';
import ForgotPassword from './pages/user/Auth/ForgotPassword';

// User/Party Freak Pages
import Home from './pages/user/Events/Home';
import EventDetails from './pages/user/Events/EventDetails';
import BuyTicket from './pages/user/Events/BuyTicket';
import Dashboard from './pages/user/Dashboard/Dashboard';
import DashboardEnhanced from './pages/user/Dashboard/DashboardEnhanced';
import Checkout from './pages/user/Checkout/Checkout';
import CheckoutEnhanced from './pages/user/Checkout/CheckoutEnhanced';
import PaymentPending from './pages/user/Payment/PaymentPending';
import PaymentSuccessful from './pages/user/Payment/PaymentSuccessful';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvents from './pages/organizer/CreateEvents';
import MyEvents from './pages/organizer/MyEvents';
import OrganizerProfile from './pages/organizer/OrganizerProfile';
import TicketSales from './pages/organizer/TicketSales';
import ScanTicket from './pages/organizer/ScanTicket';
import SelectEventToScan from './pages/organizer/SelectEventToScan';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminOrganizers from './pages/admin/AdminOrganizers';
import AdminSalesAnalytics from './pages/admin/AdminSalesAnalytics';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';

// Error Page
import NotFound from './pages/NotFound';

const AppRouting = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-as" element={<RegisterAs />} />
          <Route path="/register/organizer" element={<Register />} />
          <Route path="/register/party-freak" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* User/Party Freak Routes - Protected */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/event/:eventId" element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          } />
          <Route path="/buy-ticket/:eventId" element={
            <ProtectedRoute>
              <BuyTicket />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/enhanced" element={
            <ProtectedRoute>
              <DashboardEnhanced />
            </ProtectedRoute>
          } />
          <Route path="/checkout/:paymentId" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/checkout/enhanced/:paymentId" element={
            <ProtectedRoute>
              <CheckoutEnhanced />
            </ProtectedRoute>
          } />
          <Route path="/payment/pending/:paymentId" element={
            <ProtectedRoute>
              <PaymentPending />
            </ProtectedRoute>
          } />
          <Route path="/payment/successful/:paymentId" element={
            <ProtectedRoute>
              <PaymentSuccessful />
            </ProtectedRoute>
          } />

          {/* Organizer Routes - Protected & Role-based */}
          <Route path="/organizer/dashboard" element={
            <ProtectedRoute>
              <OrganizerRoute>
                <OrganizerDashboard />
              </OrganizerRoute>
            </ProtectedRoute>
          } />
          <Route path="/organizer/create-event" element={
            <ProtectedRoute>
              <OrganizerRoute>
                <CreateEvents />
              </OrganizerRoute>
            </ProtectedRoute>
          } />
          <Route path="/organizer/my-events" element={
            <ProtectedRoute>
              <OrganizerRoute>
                <MyEvents />
              </OrganizerRoute>
            </ProtectedRoute>
          } />
          <Route path="/organizer/profile" element={
            <ProtectedRoute>
              <OrganizerRoute>
                <OrganizerProfile />
              </OrganizerRoute>
            </ProtectedRoute>
          } />
          <Route path="/organizer/ticket-sales/:eventId" element={
            <ProtectedRoute>
              <OrganizerRoute>
                <TicketSales />
              </OrganizerRoute>
            </ProtectedRoute>
          } />
          <Route path="/organizer/scan-tickets" element={
            <ProtectedRoute>
              <OrganizerRoute>
                <SelectEventToScan />
              </OrganizerRoute>
            </ProtectedRoute>
          } />
          <Route path="/organizer/scan-ticket/:eventId" element={
            <ProtectedRoute>
              <OrganizerRoute>
                <ScanTicket />
              </OrganizerRoute>
            </ProtectedRoute>
          } />

          {/* Admin Routes - Protected & Role-based */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminEvents />
              </AdminRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/organizers" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminOrganizers />
              </AdminRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminSalesAnalytics />
              </AdminRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/withdrawals" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminWithdrawals />
              </AdminRoute>
            </ProtectedRoute>
          } />

          {/* 404 Not Found */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouting;
