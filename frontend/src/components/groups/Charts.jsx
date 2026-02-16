const Charts = ({ balances }) => {
  const max = Math.max(...Object.values(balances).map(Math.abs), 1);

  return (
    <div className="group-section">
      <h4>Balance Overview</h4>

      {Object.entries(balances).map(([name, amt]) => (
        <div key={name} className="chart-row">
          <span>{name}</span>
          <div className="bar-wrap">
            <div
              className={amt >= 0 ? "bar positive" : "bar negative"}
              style={{ width: `${(Math.abs(amt) / max) * 100}%` }}
            />
          </div>
          <span>₹{Math.round(amt)}</span>
        </div>
      ))}
    </div>
  );
};

export default Charts;
