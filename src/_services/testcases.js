import API from "../_api";
import message from "../_utilities/errorMessage";

export const getTestcases = async (assignment_number = "admin") => {
  const { data: response } = await API.get(`/testcases/${assignment_number}`);
  return response.data;
};

export const createTestcase = async (assignment_number, data) => {
  try {
    const response = await API.post(`/testcases/${assignment_number}`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const deleteTestcase = async (assignment_number, testcase_number) => {
  try {
    const response = await API.delete(
      `testcases/${assignment_number}/${testcase_number}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};
