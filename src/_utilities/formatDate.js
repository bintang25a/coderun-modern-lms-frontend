export const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  const options = { day: "2-digit", month: "long", year: "numeric" };
  const formattedIndo = date.toLocaleDateString("id-ID", options);

  return formattedIndo;
};
