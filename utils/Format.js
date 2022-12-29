const moment = require("moment");
const capitalize = (str) => {
  if (typeof str === "string") {
    return str.replace(/^\w/, (c) => c.toUpperCase());
  } else {
    return "";
  }
};
const formatDate = (input) => {
  const date = new Date(input);
  return capitalize(
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "full",
      timeStyle: "medium",
    }).format(date)
  );
};
const format = (input) => {
  const date = new Date(input);
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
};

const isToDay = (input) => {
  return format(new Date(input)) === format(new Date());
};
module.exports = {
  formatDate,
  isToDay,
};
