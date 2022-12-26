const path = require("path");
const fs = require("fs");

const urlBase = path.join(__dirname, "..", "files");

export const createLocalDirectory = (customer_name, folder_names = []) => {
  try {
    fs.mkdir(path.join(urlBase, customer_name), () => {
      folder_names.map((name) => {
        const folder = path.join(urlBase, customer_name, name);
        fs.mkdir(folder, (resp) => {});
      });
    });
  } catch (error) {
    console.log(`${error} `);
  }
};

export const deleteLocalDirectory = (customer_name) => {
  try {
    fs.rm(
      path.join(urlBase, customer_name),
      { recursive: true, force: true },
      (rep) => {}
    );
  } catch (error) {
    console.log(`${error} `);
  }
};

