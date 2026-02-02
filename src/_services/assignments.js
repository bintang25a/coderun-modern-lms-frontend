import API from "../_api";
import message from "../_utilities/errorMessage";

export const getAssignments = async () => {
  const { data: response } = await API.get("/assignments");
  return response.data;
};

export const showAssignment = async (assignment_number) => {
  try {
    const { data: response } = await API.get(
      `/assignments/${assignment_number}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const createAssignment = async (data) => {
  try {
    const response = await API.post("/assignments", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const updateAssignment = async (assignment_number, data) => {
  try {
    const response = await API.patch(`assignments/${assignment_number}`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const deleteAssignment = async (assignment_number) => {
  try {
    const response = await API.delete(`assignments/${assignment_number}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};
