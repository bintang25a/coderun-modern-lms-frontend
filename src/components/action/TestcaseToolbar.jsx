import { useState } from "react";
import {
  AiOutlineDelete,
  AiOutlineFileAdd,
  AiOutlineFileSearch,
} from "react-icons/ai";
import { FaRotate } from "react-icons/fa6";

const TestcaseToolbar = ({
  testcases,
  toggleModal,
  setModal,
  onSubmit,
  onDelete,
}) => {
  const [isVertical, setIsVertical] = useState(false);

  const inputFields = [
    {
      name: "name",
      label: "Name testcase",
      placeholder: "Testcase name (not space)",
    },
    {
      type: "number",
      name: "weight",
      label: "Testcase weight",
      placeholder: "2",
    },
    {
      name: "input",
      label: "Input testcase",
      placeholder: "Input your testcase here: 5 3 8 c",
    },
  ];

  const viewFields = testcases?.map((t) => ({
    name: t?.name,
    label: t?.name,
    value: `Weight(${t?.weight}) : input[${t?.input}]`,
  }));

  const deleteFields = [
    {
      type: "select",
      label: "Select testcase",
      name: "testcase_number",
      options: testcases?.map((t) => ({
        label: `Weight(${t?.weight}) : input[${t?.input}]`,
        value: t?.testcase_number,
      })),
    },
  ];

  return (
    <div className={`toolbar__public-page ${isVertical ? "vertical" : ""}`}>
      <div
        title="Rotate"
        className="toolbar-item__public-page"
        onClick={() => setIsVertical(!isVertical)}
      >
        <FaRotate className="icon__public-page" />
      </div>
      <button
        title="Add Testcase"
        className="toolbar-item__public-page button__public-page"
        onClick={() =>
          toggleModal({
            title: "ADD TESTCASE",
            message: "Create testcase success",
            isActive: true,
            type: "Testcase",
            fields: inputFields,
            onSubmit,
            setModal,
          })
        }
      >
        <AiOutlineFileAdd />
      </button>
      <button
        title="View Testcase"
        className="toolbar-item__public-page button__public-page"
        disabled={testcases?.length === 0}
        onClick={() =>
          toggleModal({
            title: "VIEW TESTCASE",
            isActive: true,
            isView: true,
            isVertical: true,
            type: "Testcase",
            fields: viewFields,
            setModal,
          })
        }
      >
        <AiOutlineFileSearch />
      </button>
      <button
        title="Delete Testcase"
        className="toolbar-item__public-page button__public-page"
        disabled={testcases?.length === 0}
        onClick={() =>
          toggleModal({
            title: "DELETE TESTCASE",
            message: "Remove testcase success",
            isActive: true,
            type: "Testcase",
            fields: deleteFields,
            onSubmit: onDelete,
            setModal,
          })
        }
      >
        <AiOutlineDelete />
      </button>
    </div>
  );
};

export default TestcaseToolbar;
