import API from "../_api";
import message from "../_utilities/errorMessage";

export const getAssignments = async (class_code, query = "") => {
  const { data: response } = await API.get(
    `/assignments/${class_code}?${query}`
  );
  return response.data;
};

export const showAssignment = async (class_code, assignment_number) => {
  try {
    const { data: response } = await API.get(
      `/assignments/${class_code}/${assignment_number}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const createAssignment = async (class_code, data) => {
  try {
    const response = await API.post(`/assignments/${class_code}`, data);
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
