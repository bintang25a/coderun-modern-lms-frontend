const CodeInput = ({ value, handleChange, span = 1, fontSize, children }) => {
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
      className={`code-input__grid-item-component width-${span}__grid-item-component`}
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

export default CodeInput;
