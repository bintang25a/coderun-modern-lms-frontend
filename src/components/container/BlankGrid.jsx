const BlankGrid = ({ span = 1, children }) => {
  return (
    <div
      className={`blank-grid__container-component width-${span}__grid-item-component`}
    >
      {children}
    </div>
  );
};

export default BlankGrid;
