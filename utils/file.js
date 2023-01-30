const { downLoadCustomerFile } = require("./cronTasks");

const readPayementFile = async (customer, file_name, directory) => {
  const newCustomer = [];
  if (directory === "in") {
    //1. Stockage du fichier dans le répertoire local
    newCustomer = await downLoadCustomerFile(customer, file_name, directory);
    console.log({ newCustomer });
  }
  return newCustomer;
};

module.exports = {
  readPayementFile,
};
