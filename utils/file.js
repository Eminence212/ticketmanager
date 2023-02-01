const { downLoadCustomerFile } = require("./cronTasks");
const path = require("path");
const fs = require("fs");
var parseString = require("xml2js").parseString;

const readPayementFile = async (customer, file_name, directory) => {
  let resutat = [];
  //1. Stockage du fichier dans le répertoire local
  const newCustomer = await downLoadCustomerFile(
    customer,
    file_name,
    directory
  );

  //2. Lecture du fichier dans le répertoire

  const filePath = path.join(
    __dirname,
    "..",
    `files/${newCustomer[0].name}/${directory}/${file_name}`
  );
  const data = fs.readFileSync(filePath, {
    encoding: "utf8",
  });

  parseString(data, { trim: true }, function (err, data) {
    resutat = JSON.parse(JSON.stringify(data));
  });

  return resutat?.Document;
};

module.exports = {
  readPayementFile,
};
