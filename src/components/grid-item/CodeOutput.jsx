const CodeOutput = ({ value, handleChange, output, span = 1 }) => {
  return (
    <div
      className={`code-output__grid-item-component width-${span}__grid-item-component`}
    >
      <div className="output-field__grid-item-component">
        <pre className="pre__grid-item-component">
          <code className="code__grid-item-component">{output}</code>
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
