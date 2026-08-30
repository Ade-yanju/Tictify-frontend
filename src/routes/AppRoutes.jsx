import { BrowserRouter, Routes, Route } from "react-router-dom";

/* ================= PUBLIC ================= */
import Home from "../pages/Home";
import PublicEvents from "../pages/PublicEvents";
import EventDetails from "../pages/EventDetails";
import Checkout from "../pages/Checkout";
import TicketSuccess from "../pages/TicketSuccess";
import PaymentPending from "../pages/PaymentPending";
import MyTickets from "../pages/MyTickets";
import CampusAmbassadors from "../pages/CampusAmbassadors";
import AmbassadorDashboard from "../pages/AmbassadorDashboard";
import BecomeAffiliate from "../pages/BecomeAffiliate";
import Legal from "../pages/Legal";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Feedback from "../pages/Feedback";
import AffiliateDashboard from "../pages/AffiliateDashboard";
/* ================= AUTH ================= */
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

/* ================= ORGANIZER ================= */
import OrganizerDashboard from "../pages/organizer/OrganizerDashboard";
import ScanTicket from "../pages/organizer/ScanTicket";
import CreateEvent from "../pages/organizer/CreateEvent";
import MyEvents from "../pages/organizer/MyEvents";
import TicketSales from "../pages/organizer/TicketSales";
import WithdrawRevenue from "../pages/organizer/WithdrawRevenue";
import OrganizerEventStats from "../pages/organizer/OrganizerEventStats";
import OrganizerReferrals from "../pages/organizer/OrganizerReferrals";
import OrganizerInsights from "../pages/organizer/OrganizerInsights";
import SelectEventToScan from "../pages/organizer/SelectEventToScan";
/* ================= ADMIN ================= */
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminOrganizers from "../pages/admin/AdminOrganizers";
import AdminWithdrawals from "../pages/admin/AdminWithdrawals";
import AdminEvents from "../pages/admin/AdminEvents";
import AdminSalesAnalytics from "../pages/admin/AdminSalesAnalytics";
import AdminAmbassadors from "../pages/admin/AdminAmbassadors";
import AdminAffiliates from "../pages/admin/AdminAffiliates";
import AdminFeedback from "../pages/admin/AdminFeedback";

/* ================= GUARDS ================= */
import ProtectedRoute from "./ProtectedRoute";
import OrganizerRoute from "./OrganizerRoute";
import AdminRoute from "./AdminRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========= PUBLIC ========= */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<PublicEvents />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/success/:reference" element={<TicketSuccess />} />
        <Route path="/payment/pending" element={<PaymentPending />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/campusambassadors" element={<CampusAmbassadors />} />
        <Route path="/ambassador" element={<AmbassadorDashboard />} />
        <Route path="/affiliate" element={<BecomeAffiliate />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/refunds" element={<Legal />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/become-affiliate" element={<BecomeAffiliate />} />
        <Route path="/affiliate/dashboard" element={<AffiliateDashboard />} />

        {/* ========= AUTH ========= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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
          path="/organizer/events"
          element={
            <ProtectedRoute>
              <OrganizerRoute>
                <MyEvents />
              </OrganizerRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/scan/select"
          element={
            <ProtectedRoute>
              <OrganizerRoute>
                <SelectEventToScan />
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
        <Route path="/organizer/referrals" element={<ProtectedRoute><OrganizerRoute><OrganizerReferrals /></OrganizerRoute></ProtectedRoute>} />
        <Route path="/organizer/insights" element={<ProtectedRoute><OrganizerRoute><OrganizerInsights /></OrganizerRoute></ProtectedRoute>} />

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
            <ProtectedRoute>
              <AdminRoute>
                <AdminWithdrawals />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/organizers"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminOrganizers />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/events"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminEvents />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/sales"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminSalesAnalytics />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ambassadors"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminAmbassadors />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/affiliates"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminAffiliates />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/admin/feedback" element={<ProtectedRoute><AdminRoute><AdminFeedback /></AdminRoute></ProtectedRoute>} />

        {/* ========= FALLBACK ========= */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
