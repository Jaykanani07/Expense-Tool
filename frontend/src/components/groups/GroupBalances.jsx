import React, { useEffect, useState } from "react";

const toPaise = (value) => Math.round(Number(value || 0) * 100);

const formatINR = (value) => {
  const n = Number(value || 0);
  return Number.isInteger(n) ? `${n}` : n.toFixed(2);
};

const getSettlements = (balances) => {
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([name, amount]) => {
    const paise = toPaise(amount);

    // Ignore tiny floating-point residues
    if (Math.abs(paise) <= 1) return;

    if (paise > 0) creditors.push({ name, paise });
    if (paise < 0) debtors.push({ name, paise: -paise });
  });

  // Largest-first generally reduces number of transactions in practice
  creditors.sort((a, b) => b.paise - a.paise);
  debtors.sort((a, b) => b.paise - a.paise);

  const settlements = [];
  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const payPaise = Math.min(debtors[i].paise, creditors[j].paise);
    const amount = payPaise / 100;

    settlements.push({
      from: debtors[i].name,
      to: creditors[j].name,
      amount,
    });

    debtors[i].paise -= payPaise;
    creditors[j].paise -= payPaise;

    if (debtors[i].paise <= 0) i++;
    if (creditors[j].paise <= 0) j++;
  }

  return settlements;
};

const GroupBalances = ({ balances = {}, currentUserName = "" }) => {
  const settlements = getSettlements(balances);
  const myBalance = Number(balances?.[currentUserName] || 0);
  const myPay = settlements.filter((s) => s.from === currentUserName);
  const myReceive = settlements.filter((s) => s.to === currentUserName);

  // 🔹 NEW: animation state
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (settlements.length === 0) {
      setShowSuccess(true);
    } else {
      setShowSuccess(false);
    }
  }, [settlements.length]);

  return (
    <div className="group-section">
      {currentUserName ? (
        <>
          <h4>Your Summary</h4>

          <div className="summary-row">
            <span>{currentUserName}</span>
            <span className={myBalance >= 0 ? "positive" : "negative"}>
              {myBalance >= 0
                ? `you receive ₹${formatINR(myBalance)}`
                : `you pay ₹${formatINR(Math.abs(myBalance))}`}
            </span>
          </div>

          <h4 style={{ marginTop: 20 }}>Your Settlements</h4>

          {myPay.length === 0 && myReceive.length === 0 ? (
            <div className="settlement-success">
              <div className={`success-check ${showSuccess ? "animate" : ""}`}>
                ✓
              </div>
              <p className="muted">All settled for you</p>
            </div>
          ) : (
            <>
              {myPay.map((s, i) => (
                <div key={`pay-${i}`} className="settlement-row">
                  <span>You → {s.to}</span>
                  <strong>₹{formatINR(s.amount)}</strong>
                </div>
              ))}

              {myReceive.map((s, i) => (
                <div key={`receive-${i}`} className="settlement-row">
                  <span>{s.from} → You</span>
                  <strong>₹{formatINR(s.amount)}</strong>
                </div>
              ))}
            </>
          )}
        </>
      ) : (
        <>
          <h4>Member Summary</h4>

          {Object.entries(balances).map(([name, amount]) => (
            <div key={name} className="summary-row">
              <span>{name}</span>
              <span className={Number(amount) >= 0 ? "positive" : "negative"}>
                {Number(amount) >= 0
                  ? `gets ₹${formatINR(Number(amount || 0))}`
                  : `owes ₹${formatINR(Math.abs(Number(amount || 0)))}`}
              </span>
            </div>
          ))}

          <h4 style={{ marginTop: 20 }}>Who Pays Whom</h4>

          {settlements.length === 0 ? (
            <div className="settlement-success">
              <div className={`success-check ${showSuccess ? "animate" : ""}`}>
                ✓
              </div>
              <p className="muted">All settled</p>
            </div>
          ) : (
            settlements.map((s, i) => (
              <div key={i} className="settlement-row">
                <span>
                  {s.from} → {s.to}
                </span>
                <strong>₹{formatINR(s.amount)}</strong>
              </div>
            ))
          )}
        </>
      )}

    </div>
  );
};

export default GroupBalances;
