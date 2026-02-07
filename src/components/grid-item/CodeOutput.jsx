const CodeOutput = ({ value, handleChange, output, span = 1, fontSize }) => {
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
      className={`code-output__grid-item-component width-${span}__grid-item-component`}
    >
      <div className="output-field__grid-item-component">
        <pre className="pre__grid-item-component">
          <code className={`code__grid-item-component ${classSize()}`}>
            {output}
          </code>
        </pre>
      </div>
      <div className="action-field__grid-item-component">
        <input
          className="input__grid-item-component"
          type="text"
          name="input"
          id="input"
          placeholder="Input"
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default CodeOutput;
