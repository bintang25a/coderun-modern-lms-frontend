const FileDisplay = ({ output, span = { row: 3, col: 2 }, children }) => {
  const { row, col } = span;

  return (
    <div
      className={`file-display__grid-item-component`}
      style={{
        gridRow: `span ${row}`,
        gridColumn: `span ${col}`,
      }}
    >
      <iframe
        className="display-field__grid-item-component"
        src={output}
        width="100%"
        title="PDF Viewer"
        style={{ border: "none" }}
      />
      {children}
    </div>
  );
};

export default FileDisplay;
