const RecentTransactions = ({ expenses }) => {
  return (
    <div className="group-section">
      <h4>Recent Transactions</h4>
      {expenses.slice(0, 5).map((e) => (
        <div key={e._id} className="transaction-row">
          <span>{e.title}</span>
          <span>₹{e.amount}</span>
        </div>
      ))}
    </div>
  );
};

export default RecentTransactions;
