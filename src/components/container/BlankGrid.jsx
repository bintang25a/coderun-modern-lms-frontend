const BlankGrid = ({ span = { row: 3, col: 1 }, children }) => {
  const { row, col } = span;

  return (
    <div
      className={`blank-grid__container-component`}
      style={{
        gridRow: `span ${row}`,
        gridColumn: `span ${col}`,
      }}
    >
      {children}
    </div>
  );
};

export default BlankGrid;
