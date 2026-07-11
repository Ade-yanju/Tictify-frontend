import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      {/* Vercel Web Analytics — page views + visitors, no cookies.
          Data appears under the project's Analytics tab once enabled
          in the Vercel dashboard. No-ops on localhost. */}
      <Analytics />
    </ErrorBoundary>
  );
}
