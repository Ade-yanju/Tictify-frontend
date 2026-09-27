import { useMemo, useState } from "react";
import Icon from "./Icon";

function fmtMoney(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "₦0";
  return `₦${amount.toLocaleString("en-NG")}`;
}

function transactionDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function transactionStatus(status) {
  return String(status || "PENDING").toLowerCase().replace(/_/g, " ");
}

function transactionSubtitle(transaction) {
  if (transaction.type === "WITHDRAWAL") {
    const account = transaction.accountLast4 ? ` ····${transaction.accountLast4}` : "";
    return (
      (transaction.bankName || "Bank account") +
      account +
      " · Receive " +
      fmtMoney(transaction.netAmount || 0) +
      (transaction.transferFee ? " · Transfer fee " + fmtMoney(transaction.transferFee) : "")
    );
  }
  if (transaction.type === "FEE") {
    const parts = [];
    if (transaction.platformFee) parts.push("Tictify " + fmtMoney(transaction.platformFee));
    if (transaction.processingFee) parts.push("Processing " + fmtMoney(transaction.processingFee));
    return (transaction.eventTitle || "Ticket payment") + (parts.length ? " · " + parts.join(" · ") : "");
  }
  const ticket = transaction.ticketType ? transaction.ticketType + " · " : "";
  const quantity = transaction.quantity
    ? transaction.quantity + " ticket" + (transaction.quantity === 1 ? "" : "s")
    : "Ticket";
  return ticket + quantity + (transaction.type === "INSTALLMENT" ? " · Deposit received" : " · Wallet credited");
}

function transactionAmount(transaction) {
  if (transaction.type === "TICKET_SALE") return "+" + fmtMoney(transaction.amount || 0);
  if (transaction.type === "WITHDRAWAL") {
    return transaction.direction === "RETURNED"
      ? "+" + fmtMoney(transaction.amount || 0)
      : "−" + fmtMoney(transaction.amount || 0);
  }
  return fmtMoney(transaction.amount || 0);
}

export default function OrganizerTransactionHistory({ transactions = [] }) {
  const [filter, setFilter] = useState("ALL");
  const filters = [
    { id: "ALL", label: "All" },
    { id: "SALES", label: "Ticket sales" },
    { id: "WITHDRAWALS", label: "Withdrawals" },
    { id: "FEES", label: "Fees" },
  ];

  const summary = useMemo(() => {
    const sales = transactions
      .filter((item) => item.type === "TICKET_SALE" && item.status === "SUCCESS")
      .reduce((total, item) => total + Number(item.amount || 0), 0);
    const withdrawals = transactions
      .filter((item) => item.type === "WITHDRAWAL" && item.direction === "DEBIT")
      .reduce((total, item) => total + Number(item.amount || 0), 0);
    const fees = transactions.reduce((total, item) => {
      if (item.type === "FEE" && item.status !== "FAILED") return total + Number(item.amount || 0);
      if (item.type === "WITHDRAWAL" && item.direction === "DEBIT") return total + Number(item.transferFee || 0);
      return total;
    }, 0);
    return { sales, withdrawals, fees };
  }, [transactions]);

  const visible = transactions
    .filter((item) => {
      if (filter === "SALES") return item.type === "TICKET_SALE" || item.type === "INSTALLMENT";
      if (filter === "WITHDRAWALS") return item.type === "WITHDRAWAL";
      if (filter === "FEES") return item.type === "FEE" || (item.type === "WITHDRAWAL" && Number(item.transferFee || 0) > 0);
      return true;
    })
    .slice(0, 50);

  return (
    <section className="odb-section odb-transactions" aria-labelledby="organizer-transactions-title">
      <div className="odb-section-head odb-tx-head">
        <div>
          <p className="odb-kicker">Account ledger</p>
          <h2 className="odb-section-title" id="organizer-transactions-title">Transaction history</h2>
          <p className="odb-tx-description">Ticket income, payout activity, and payment fees in one view.</p>
        </div>
      </div>

      <div className="odb-tx-summary">
        <div className="odb-tx-summary-card is-income"><span>Ticket sales</span><strong>{fmtMoney(summary.sales)}</strong></div>
        <div className="odb-tx-summary-card is-outgoing"><span>Withdrawals</span><strong>{fmtMoney(summary.withdrawals)}</strong></div>
        <div className="odb-tx-summary-card is-fee"><span>Fees paid</span><strong>{fmtMoney(summary.fees)}</strong></div>
      </div>

      <div className="odb-tx-filters" role="tablist" aria-label="Filter transaction history">
        {filters.map((item) => (
          <button
            type="button"
            key={item.id}
            role="tab"
            aria-selected={filter === item.id}
            className={filter === item.id ? "is-active" : ""}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length ? (
        <div className="odb-tx-list">
          {visible.map((transaction, index) => (
            <article
              className="odb-tx-row"
              key={transaction.id || transaction.reference || `${transaction.createdAt}-${transaction.type}-${index}`}
            >
              <span className={`odb-tx-icon is-${String(transaction.type || "ticket").toLowerCase()}`}>
                <Icon name={transaction.type === "WITHDRAWAL" ? "wallet" : transaction.type === "FEE" ? "info" : "ticket"} />
              </span>
              <div className="odb-tx-main">
                <strong>{transaction.title || "Transaction"}</strong>
                <p>{transactionSubtitle(transaction)}</p>
                <small>
                  {transactionDate(transaction.createdAt)}
                  {transaction.reference ? " · Ref " + String(transaction.reference).slice(-12) : ""}
                </small>
              </div>
              <div className="odb-tx-value">
                <strong className={`is-${String(transaction.direction || "info").toLowerCase()}`}>
                  {transactionAmount(transaction)}
                </strong>
                <span className={`odb-tx-status is-${String(transaction.status || "PENDING").toLowerCase()}`}>
                  {transactionStatus(transaction.status)}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="odb-tx-empty">
          <Icon name="ticket" />
          <strong>No transactions yet</strong>
          <span>Your ticket sales and withdrawals will appear here.</span>
        </div>
      )}
    </section>
  );
}
