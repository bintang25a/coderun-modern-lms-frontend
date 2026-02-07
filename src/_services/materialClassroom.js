import API from "../_api";
import message from "../_utilities/errorMessage";

export const getClassMaterials = async () => {
  const { data: response } = await API.get("/classmaterial");
  return response.data;
};

export const createClassMaterial = async (classCode, material_number) => {
  try {
    const response = await API.post(
      `classmaterial/${classCode}/${material_number}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const deleteClassMaterial = async (classCode, material_number) => {
  try {
    const response = await API.delete(
      `classmaterial/${classCode}/${material_number}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};
