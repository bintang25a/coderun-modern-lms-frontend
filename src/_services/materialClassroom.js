import API from "../_api";
import message from "../_utilities/errorMessage";

export const getClassMaterials = async () => {
  const { data: response } = await API.get("/classmaterial");
  return response.data;
};

export const createClassMaterial = async (data) => {
  try {
    const response = await API.post("/classmaterial", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw message(error);
  }
};

export const updateClassMaterial = async (classCode, material_number, data) => {
  try {
    const response = await API.patch(
      `classmaterial/${classCode}/${material_number}`,
      data
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
