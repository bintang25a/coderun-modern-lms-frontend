import API from "../_api";
import message from "../_utilities/errorMessage";

export const runCode = async (data) => {
  try {
    const response = await API.post("/run", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const updateAssignment = async (class_code, assignment_number, data) => {
  try {
    const response = await API.patch(
      `assignments/${class_code}/${assignment_number}`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const deleteAssignment = async (class_code, assignment_number) => {
  try {
    const response = await API.delete(
      `assignments/${class_code}/${assignment_number}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};
