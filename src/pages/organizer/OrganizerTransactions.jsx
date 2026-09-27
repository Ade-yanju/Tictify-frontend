import { useEffect, useState } from "react";
import OrganizerChrome from "../../components/OrganizerChrome";
import OrganizerTransactionHistory from "../../components/OrganizerTransactionHistory";
import TictifyLoader from "../../components/TictifyLoader";
import { fetchOrganizerDashboard } from "../../services/dashboardService";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = content;
    document.head.appendChild(style);
  }
}

export default function OrganizerTransactions() {
  injectStyles("tictify-organizer-transactions-page", CSS);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchOrganizerDashboard()
      .then((data) => {
        if (active) setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
      })
      .catch((err) => {
        if (active && err?.type !== "AUTH") setError("We could not load your transaction history. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <OrganizerChrome
      active="/organizer/transactions"
      title="Transaction history"
      subtitle="See your ticket sales, withdrawals, and every fee recorded against your organizer wallet."
    >
      <div className="org-tx-page">
        {loading ? (
          <div className="org-tx-loading"><TictifyLoader compact label="Loading your transactions…" /></div>
        ) : error ? (
          <div className="org-tx-error" role="alert">{error}</div>
        ) : (
          <OrganizerTransactionHistory transactions={transactions} />
        )}
      </div>
    </OrganizerChrome>
  );
}

const CSS = `
.org-tx-page { width: min(100%, 1120px); margin: 0 auto; }
.org-tx-page .odb-transactions { margin-top: 0; }
.org-tx-loading { display: grid; min-height: 260px; place-items: center; border: 1px solid #e7dff0; border-radius: 22px; background: #fff; }
.org-tx-error { padding: 18px 20px; border: 1px solid #f1cbd4; border-radius: 14px; background: #fff7f8; color: #a9465a; font-size: 13px; }
`;
