import { lazy, Suspense } from 'react';
import Loader from '../components/Loader/Loader';

// Lazy load production pages
const HomePage = lazy(() => import('../pages/Landing'));
const LoginPage = lazy(() => import('../pages/user/Auth/Login'));
const RegisterPage = lazy(() => import('../pages/user/Auth/Register'));
const ForgotPasswordPage = lazy(() => import('../pages/user/Auth/ForgotPassword'));
const RegisterAsPage = lazy(() => import('../pages/user/Auth/RegisterAs'));
const EventDetailsPage = lazy(() => import('../pages/user/Events/EventDetails'));
const EventsHomePage = lazy(() => import('../pages/user/Events/Home'));
const BuyTicketPage = lazy(() => import('../pages/user/Events/BuyTicket'));
const CheckoutPage = lazy(() => import('../pages/user/Checkout/Checkout'));
const DashboardPage = lazy(() => import('../pages/user/Dashboard/Dashboard'));
const PaymentPendingPage = lazy(() => import('../pages/user/Payment/PaymentPending'));
const PaymentSuccessfulPage = lazy(() => import('../pages/user/Payment/PaymentSuccessful'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminEventsPage = lazy(() => import('../pages/admin/AdminEvents'));
const AdminOrganizersPage = lazy(() => import('../pages/admin/AdminOrganizers'));
const AdminSalesAnalyticsPage = lazy(() => import('../pages/admin/AdminSalesAnalytics'));
const AdminWithdrawalsPage = lazy(() => import('../pages/admin/AdminWithdrawals'));
const OrganizerDashboardPage = lazy(() => import('../pages/organizer/OrganizerDashboard'));
const CreateEventsPage = lazy(() => import('../pages/organizer/CreateEvents'));
const MyEventsPage = lazy(() => import('../pages/organizer/MyEvents'));
const TicketSalesPage = lazy(() => import('../pages/organizer/TicketSales'));
const ScanTicketPage = lazy(() => import('../pages/organizer/ScanTicket'));
const SelectEventToScanPage = lazy(() => import('../pages/organizer/SelectEventToScan'));
const OrganizerProfilePage = lazy(() => import('../pages/organizer/OrganizerProfile'));
const WithdrawRevenuePage = lazy(() => import('../pages/organizer/WithdrawRevenue'));
const PublicEventsPage = lazy(() => import('../pages/PublicEvents'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

// Loader component for suspense fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <Loader />
  </div>
);

export const routes = [
  // Public routes
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/register-as',
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterAsPage />
      </Suspense>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForgotPasswordPage />
      </Suspense>
    ),
  },
  {
    path: '/events',
    element: (
      <Suspense fallback={<PageLoader />}>
        <EventsHomePage />
      </Suspense>
    ),
  },
  {
    path: '/events/:eventId',
    element: (
      <Suspense fallback={<PageLoader />}>
        <EventDetailsPage />
      </Suspense>
    ),
  },
  {
    path: '/buy-ticket/:eventId',
    element: (
      <Suspense fallback={<PageLoader />}>
        <BuyTicketPage />
      </Suspense>
    ),
  },
  {
    path: '/checkout',
    element: (
      <Suspense fallback={<PageLoader />}>
        <CheckoutPage />
      </Suspense>
    ),
  },
  {
    path: '/home',
    element: (
      <Suspense fallback={<PageLoader />}>
        <EventsHomePage />
      </Suspense>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<PageLoader />}>
        <DashboardPage />
      </Suspense>
    ),
  },
  {
    path: '/payment-pending/:paymentId',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PaymentPendingPage />
      </Suspense>
    ),
  },
  {
    path: '/payment-successful/:paymentId',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PaymentSuccessfulPage />
      </Suspense>
    ),
  },

  // Admin routes
  {
    path: '/admin/dashboard',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminDashboardPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/events',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminEventsPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/organizers',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminOrganizersPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/analytics',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminSalesAnalyticsPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/withdrawals',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminWithdrawalsPage />
      </Suspense>
    ),
  },

  // Organizer routes
  {
    path: '/organizer/dashboard',
    element: (
      <Suspense fallback={<PageLoader />}>
        <OrganizerDashboardPage />
      </Suspense>
    ),
  },
  {
    path: '/organizer/create-event',
    element: (
      <Suspense fallback={<PageLoader />}>
        <CreateEventsPage />
      </Suspense>
    ),
  },
  {
    path: '/organizer/my-events',
    element: (
      <Suspense fallback={<PageLoader />}>
        <MyEventsPage />
      </Suspense>
    ),
  },
  {
    path: '/organizer/ticket-sales/:eventId',
    element: (
      <Suspense fallback={<PageLoader />}>
        <TicketSalesPage />
      </Suspense>
    ),
  },
  {
    path: '/organizer/scan-ticket',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ScanTicketPage />
      </Suspense>
    ),
  },
  {
    path: '/organizer/select-event-to-scan',
    element: (
      <Suspense fallback={<PageLoader />}>
        <SelectEventToScanPage />
      </Suspense>
    ),
  },
  {
    path: '/organizer/profile',
    element: (
      <Suspense fallback={<PageLoader />}>
        <OrganizerProfilePage />
      </Suspense>
    ),
  },
  {
    path: '/organizer/withdraw',
    element: (
      <Suspense fallback={<PageLoader />}>
        <WithdrawRevenuePage />
      </Suspense>
    ),
  },

  // Catch-all for 404
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];
