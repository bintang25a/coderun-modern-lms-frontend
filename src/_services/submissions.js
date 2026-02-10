import API from "../_api";
import message from "../_utilities/errorMessage";

export const getSubmissions = async (assignment_number, query = "") => {
  const { data: response } = await API.get(
    `/submissions/${assignment_number}?${query}`
  );
  return response.data;
};

export const showSubmission = async (assignment_number, submission_number) => {
  try {
    const { data: response } = await API.get(
      `/submissions/${assignment_number}/${submission_number}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const fileSubmission = async (assignment_number, submission_number) => {
  try {
    const response = await API.get(
      `/submissions/${assignment_number}/${submission_number}/file`,
      {
        responseType: "blob",
      }
    );

    const blob = response.data;

    return blob;
  } catch (error) {
    console.error(message(error));
    throw message(error);
  }
};

export const createSubmission = async (assignment_number, data) => {
  try {
    const response = await API.post(`/submissions/${assignment_number}`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const updateSubmission = async (
  assignment_number,
  submission_number,
  data
) => {
  try {
    const response = await API.patch(
      `submissions/${assignment_number}/${submission_number}`,
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const deleteSubmission = async (
  assignment_number,
  submission_number
) => {
  try {
    const response = await API.delete(
      `submissions/${assignment_number}/${submission_number}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};
