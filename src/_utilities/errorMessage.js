const message = (error) => {
   if (error.status == 422) {
      if (error.response?.data == {}) {
         return Object.values(error.response?.data["message"]).join("\n");
      } else {
         return Object.values(error.response?.data).join("\n");
      }
   } else {
      return error.response?.data["message"];
   }
};

export default message;
