const CodeInput = ({ value, handleChange, span = 1, children }) => {
  return (
    <div
      className={`code-input__grid-item-component width-${span}__grid-item-component`}
    >
      <textarea
        className="input-field__grid-item-component"
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
