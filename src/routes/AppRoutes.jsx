import { BrowserRouter, Routes, Route } from "react-router-dom";

/* ================= PUBLIC ================= */
import Home from "../pages/Home";
import PublicEvents from "../pages/PublicEvents";
import EventDetails from "../pages/EventDetails";
import Checkout from "../pages/Checkout";
import TicketSuccess from "../pages/TicketSuccess";

/* ================= AUTH ================= */
import Login from "../pages/Login";
import Register from "../pages/Register";

/* ================= ORGANIZER ================= */
import OrganizerDashboard from "../pages/organizer/OrganizerDashboard";
import ScanTicket from "../pages/organizer/ScanTicket";
import CreateEvent from "../pages/organizer/CreateEvent.jsx";
import MyEvents from "../pages/organizer/MyEvents.jsx";
import TicketSales from "../pages/organizer/TicketSales.jsx";
import WithdrawRevenue from "../pages/organizer/WithdrawRevenue.jsx";
import OrganizerEventStats from "../pages/organizer/OrganizerEventStats.jsx";
/* ================= ADMIN ================= */
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminOrganizers from "../pages/admin/AdminOrganizers";
import AdminWithdrawals from "../pages/admin/AdminWithdrawals.jsx";
import AdminEvents from "../pages/admin/AdminEvents.jsx";
import AdminSalesAnalytics from "../pages/admin/AdminSalesAnalytics.jsx";
/* ================= GUARDS ================= */
import ProtectedRoute from "./ProtectedRoute.jsx";
import OrganizerRoute from "./OrganizerRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========= PUBLIC (GUEST) ========= */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<PublicEvents />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/success" element={<TicketSuccess />} />

        {/* ========= AUTH ========= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ========= ORGANIZER ========= */}
        <Route
          path="/organizer/dashboard"
          element={
            <ProtectedRoute>
              <OrganizerRoute>
                <OrganizerDashboard />
              </OrganizerRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/create-event"
          element={
            <ProtectedRoute>
              <OrganizerRoute>
                <CreateEvent />
              </OrganizerRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/event"
          element={
            <ProtectedRoute>
              <OrganizerRoute>
                <MyEvents />
              </OrganizerRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/scan"
          element={
            <ProtectedRoute>
              <OrganizerRoute>
                <ScanTicket />
              </OrganizerRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/sales"
          element={
            <ProtectedRoute>
              <OrganizerRoute>
                <TicketSales />
              </OrganizerRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/stats"
          element={
            <ProtectedRoute>
              <OrganizerRoute>
                <OrganizerEventStats />
              </OrganizerRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/withdraw"
          element={
            <ProtectedRoute>
              <OrganizerRoute>
                <WithdrawRevenue />
              </OrganizerRoute>
            </ProtectedRoute>
          }
        />
        {/* ========= ADMIN ========= */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/withdrawals"
          element={
            <AdminRoute>
              <AdminWithdrawals />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/organizers"
          element={
            <AdminRoute>
              <AdminOrganizers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <AdminRoute>
              <AdminEvents />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/sales"
          element={
            <AdminRoute>
              <AdminSalesAnalytics />
            </AdminRoute>
          }
        />

        {/* ========= FALLBACK ========= */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
