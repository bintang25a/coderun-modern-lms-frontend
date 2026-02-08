const CodeDisplay = ({
  value,
  handleChange,
  span = { row: 3, col: 2 },
  fontSize,
  children,
}) => {
  const { row, col } = span;

  const classSize = () => {
    if (fontSize === 0) {
      return "fs-small__grid-item-component";
    } else if (fontSize === 2) {
      return "fs-medium__grid-item-component";
    } else if (fontSize === 3) {
      return "fs-big__grid-item-component";
    } else {
      return "";
    }
  };

  return (
    <div
      className={`code-input__grid-item-component`}
      style={{
        gridRow: `span ${row}`,
        gridColumn: `span ${col}`,
      }}
    >
      <textarea
        className={`input-field__grid-item-component ${classSize()}`}
        name="code"
        id="code"
        value={value}
        onChange={handleChange}
        placeholder="Code will be displayed here..."
      />
      {children}
    </div>
  );
};

export default CodeDisplay;
