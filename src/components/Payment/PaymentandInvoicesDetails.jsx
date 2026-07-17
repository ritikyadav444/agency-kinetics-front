import React, { useEffect, useState } from "react";
import { baseURL } from "../../http";
import { useSelector } from "react-redux";
import { Download, CheckCircle, Payment, Delete } from "@mui/icons-material";

const PaymentInvoices = () => {
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [errorTransactions, setErrorTransactions] = useState(null);

  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [errorPaymentMethods, setErrorPaymentMethods] = useState(null);

  const combined = useSelector((state) => state.logMember.combined);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoadingTransactions(true);
      setErrorTransactions(null);
      try {
        const response = await fetch(
          `${baseURL}/api/v1/transactions-by-email?email=${combined?.user?.email}&workspace_name=${combined.user.workspace_name}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTransactions(data.charges || []);
      } catch (err) {
        setErrorTransactions(err.message || "Failed to fetch transactions");
      } finally {
        setLoadingTransactions(false);
      }
    };

    if (combined?.user?.email) {
      fetchTransactions();
    }
  }, [combined]);

  useEffect(() => {
    const fetchPaymentMethodDetails = async () => {
      setLoadingPaymentMethods(true);
      setErrorPaymentMethods(null);
      try {
        const response = await fetch(
          `${baseURL}/api/v1/payment-method-details?email=${combined?.user?.email}&workspace_name=${combined.user.workspace_name}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPaymentMethods(data.payment_methods || []);
      } catch (err) {
        setErrorPaymentMethods(
          err.message || "Failed to fetch payment methods"
        );
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    if (combined?.user?.email) {
      fetchPaymentMethodDetails();
    }
  }, [combined]);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Payment Methods Header (outside white box) */}
      <h2
        style={{
          marginTop: "1.5rem",
          fontSize: "2rem",
          fontWeight: "700",
          color: "#333",
        }}
      >
        Payment Methods
      </h2>

      {/* Payment Methods Section */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          padding: "1.5rem",
          marginTop: "0.5rem",
        }}
      >
        {loadingPaymentMethods ? (
          <div>Loading Payment Methods...</div>
        ) : errorPaymentMethods ? (
          <div style={{ fontSize: '1.3rem', color: 'rgb(127, 86, 217)' }}>No payment methods found.</div>
        ) : paymentMethods.length === 0 ? (
          <p style={{ color: "#6b7280", margin: 0 }}>
            No payment methods found.
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {paymentMethods.map((pm) => (
              <div
                key={pm.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  border: "1px solid #f3f4f6",
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                  transition: "background-color 0.15s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fafafa")
                }
              >
                {/* Left side - Card icon and info */}
                <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2rem",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "0.75rem",
                    }}
                  >
                    <Payment
                      style={{
                        height: "1rem",
                        width: "1rem",
                        color: "#6b7280",
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "1rem",
                        color: "#111827",
                        fontWeight: "700",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {pm.brand.charAt(0).toUpperCase() + pm.brand.slice(1)}{" "}
                      ending in {pm.last4}
                    </div>

                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {pm.name || "NA"}
                    </div>
                  </div>
                </div>

                {/* Middle - Default badge */}
                <div style={{ marginRight: "1rem" }}>
                  {pm.is_default && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        color: "#3b82f6",
                        backgroundColor: "#dbeafe",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.375rem",
                        border: "1px solid #93c5fd",
                      }}
                    >
                      Default for workspace
                    </span>
                  )}
                </div>

                {/* Right side - Delete button
                // <button
                //   style={{
                //     background: "none",
                //     border: "none",
                //     cursor: "pointer",
                //     padding: "0.5rem",
                //     borderRadius: "0.25rem",
                //     transition: "background-color 0.15s ease"
                //   }}
                //   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
                //   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                //   onClick={() => console.log('Delete payment method:', pm.id)}
                // >
                //   <Delete style={{ height: "1.25rem", width: "1.25rem", color: "#9ca3af" }} />
                // </button> */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices Header */}
      <h2
        style={{
          marginTop: "2rem",
          fontSize: "2rem",
          fontWeight: "700",
          color: "#333",
        }}
      >
        Invoices
      </h2>

      {loadingTransactions ? (
        <div>Loading Transactions...</div>
      ) : errorTransactions ? (
        <div style={{ fontSize: '1.3rem', color: 'rgb(127, 86, 217)' }}>No transactions found.</div>
      ) : transactions.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No transactions found.</p>
      ) : (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
              gap: "1rem",
              padding: "1rem 1.5rem",
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <div>Date</div>
            <div>Plan</div> {/* Changed from "Cost" to "Plan" */}
            <div>Status</div>
            <div>Invoice</div>
          </div>

          {/* Table Body */}
          <div>
            {transactions.map((txn, index) => (
              <div
                key={txn.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
                  gap: "1rem",
                  padding: "1rem 1.5rem",
                  alignItems: "center",
                  borderBottom:
                    index !== transactions.length - 1
                      ? "1px solid #e5e7eb"
                      : "none",
                  transition: "background-color 0.15s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {/* Date */}
                <div style={{ fontSize: "0.875rem", color: "#111827" }}>
                  {txn.created}
                </div>

                {/* Plan (Description + Amount) */}
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {txn.description} ({txn.amount} {txn.currency.toUpperCase()})
                </div>

                {/* Status */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CheckCircle
                    style={{
                      height: "1rem",
                      width: "1rem",
                      color: "#10b981",
                      marginRight: "0.5rem",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#059669",
                    }}
                  >
                    Paid
                  </span>
                </div>

                {/* Invoice */}
                <div>
                  {txn.receipt_url ? (
                    <a
                      href={txn.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        textDecoration: "none",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#111827")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#6b7280")
                      }
                    >
                      <Download
                        style={{
                          height: "1rem",
                          width: "1rem",
                          marginRight: "0.25rem",
                        }}
                      />
                      Download
                    </a>
                  ) : (
                    <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                      N/A
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentInvoices;
