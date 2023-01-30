const { User, Customer, sequelize } = require("../models");

const ClientSftp = require("./ClientSftp");
const path = require("path");
const { formatDate, isEqual } = require("./Format");
require("dotenv").config();
const getAllCustomers = async () => {
  const customers = await Customer.findAll({
    where: { autovalidation: true, enable: true },
    attributes: [
      "id",
      "name",
      "username",
      "inbound",
      "inbound_amp",
      "outbound",
      "outbound_amp",
      "erreur",
      "erreur_amp",
      "archive",
      "archive_amp",
      "host",
      "port",
      "enable",
      "autovalidation",
      "password",
      "response_slug",
    ],
    include: [{ model: User, attributes: ["id", "name", "role"] }],
    order: [["name", "ASC"]],
  });

  return customers;
};
const getRemoteCustomerInfos = async (customer) => {
  const { host, port, username, password, inbound, outbound, erreur, archive } =
    customer;

  let files = {
    in: [],
  };

  //Connexion au server SFTP
  const sftp = new ClientSftp(host, port, username, password);

  const { state, msg } = await sftp.connect();

  if (!state) {
    console.log({ Error: msg });
    sftp.disconnect();
  } else {
    files = {
      ...files,
      in: await sftp.listFiles(`.${inbound}`),
    };
    //Save the files to the local filesystem
    for (const key of Object.keys(files)) {
      const fileFomat = [];
      // fileFomat.push({ folder: key, data: files[key] });
      const data = files[key];

      let remotePath = "";
      let localPath = path.join(
        __dirname,
        "..",
        `files/${customer.name}/${key}`
      );

      if (data && data.length > 0) {
        switch (key) {
          case "in":
            for (let i = 0; i < data.length; i++) {
              remotePath = `${customer.inbound}/${data[i].name}`;
              localPath = path.join(
                __dirname,
                "..",
                `files/${customer.name}/${key}/${data[i].name}`
              );
              await sftp.downloadFile(remotePath, localPath);
            }
            break;

          default:
            break;
        }
      }
    }

    sftp.disconnect();
  }

  return { ...customer, files };
};
const getRemoteCustomerInfo = async (customer, file_name, directory) => {
  const { host, port, username, password, inbound, outbound, erreur, archive } =
    customer;

  let files = {
    in: [],
    out: [],
    err: [],
    arch: [],
  };

  //Connexion au server SFTP
  const sftp = new ClientSftp(host, port, username, password);

  const { state, msg } = await sftp.connect();

  if (!state) {
    console.log({ Error: msg });
    sftp.disconnect();
  } else {
    files = {
      ...files,
      in: await sftp.list(`.${inbound}`),
      out: await sftp.list(`.${outbound}`),
      err: await sftp.list(`.${erreur}`),
      arch: await sftp.list(`.${archive}`),
    };
    //Save the files to the local filesystem

    let remotePath = "";
    let localPath = path.join(
      __dirname,
      "..",
      `files/${customer.name}/${directory}`
    );

    switch (directory) {
      case "in":
        remotePath = `${customer.inbound}/${file_name}`;
        localPath = path.join(
          __dirname,
          "..",
          `files/${customer.name}/${directory}/${file_name}`
        );
        await sftp.downloadFile(remotePath, localPath);
        break;
      case "out":
        remotePath = `${customer.outbound}/${file_name}`;
        localPath = path.join(
          __dirname,
          "..",
          `files/${customer.name}/${directory}/${file_name}`
        );
        await sftp.downloadFile(remotePath, localPath);
        break;
      case "err":
        remotePath = `${customer.erreur}/${file_name}`;
        localPath = path.join(
          __dirname,
          "..",
          `files/${customer.name}/${directory}/${file_name}`
        );
        await sftp.downloadFile(remotePath, localPath);
        break;
      case "arch":
        remotePath = `${customer.archive}/${file_name}`;
        localPath = path.join(
          __dirname,
          "..",
          `files/${customer.name}/${directory}/${file_name}`
        );
        await sftp.downloadFile(remotePath, localPath);
        break;
      default:
        break;
    }

    sftp.disconnect();
  }

  return {
    ...customer,
    files: files[directory]
      ? files[directory].filter((item) => item.name === file_name)
      : [],
  };
};
const getCustomerRemoteFiles = async (customer, directory, createdAt) => {
  const { host, port, username, password, inbound, outbound, erreur, archive } =
    customer;

  let files = {
    in: [],
    out: [],
    err: [],
    arch: [],
  };

  //Connexion au server SFTP
  const sftp = new ClientSftp(host, port, username, password);

  const { state, msg } = await sftp.connect();

  if (!state) {
    console.log({ Error: msg });
    sftp.disconnect();
  } else {
    files = {
      ...files,
      in: await sftp.list(`.${inbound}`),
      out: await sftp.list(`.${outbound}`),
      err: await sftp.list(`.${erreur}`),
      arch: await sftp.list(`.${archive}`),
    };

    sftp.disconnect();
  }

  return files[directory].filter(
    (item) =>
      isEqual(item.modifyTime, createdAt) || isEqual(item.accessTime, createdAt)
  );
};
const getCbsRemoteFiles = async (customer, directory, createdAt) => {
  const { inbound_amp, outbound_amp, erreur_amp, archive_amp } = customer;
  const { SFTP_SERVER, SFTP_USER, SFTP_PASSWORD, SFTP_PORT } = process.env;

  let files = {
    in: [],
    out: [],
    err: [],
    arch: [],
  };

  //Connexion au server SFTP
  const sftp = new ClientSftp(SFTP_SERVER, SFTP_PORT, SFTP_USER, SFTP_PASSWORD);

  const { state, msg } = await sftp.connect();

  if (!state) {
    console.log({ Error: msg });
    sftp.disconnect();
  } else {
    files = {
      ...files,
      in: await sftp.list(`${inbound_amp}`),
      out: await sftp.list(`${outbound_amp}`),
      err: await sftp.list(`${erreur_amp}`),
      arch: await sftp.list(`${archive_amp}`),
    };

    sftp.disconnect();
  }

  return files[directory].filter(
    (item) =>
      isEqual(item.modifyTime, createdAt) || isEqual(item.accessTime, createdAt)
  );
};
const getRemoteInfos = async (customer) => {
  const { inbound_amp, outbound_amp, erreur_amp, archive_amp } = customer;
  const { SFTP_SERVER, SFTP_USER, SFTP_PASSWORD, SFTP_PORT } = process.env;
  let files = {
    // in: [],
    out: [],
    err: [],
    arch: [],
  };
  //Connexion au server SFTP
  const sftp = new ClientSftp(SFTP_SERVER, SFTP_PORT, SFTP_USER, SFTP_PASSWORD);
  const { state, msg } = await sftp.connect();
  if (!state) {
    console.log({ Error: msg });
    sftp.disconnect();
  } else {
    files = {
      ...files,
      // in: await sftp.listFiles(`${inbound_amp}`),
      out: await sftp.listFiles(`${outbound_amp}`),
      err: await sftp.listFiles(`${erreur_amp}`),
      arch: await sftp.listFiles(`${archive_amp}`),
    };
    //Save the files to the local filesystem
    for (const key of Object.keys(files)) {
      const fileFomat = [];
      // fileFomat.push({ folder: key, data: files[key] });
      const data = files[key];

      let remotePath = "";
      let localPath = "";

      if (data && data.length > 0) {
        switch (key) {
          case "out":
            for (let j = 0; j < data.length; j++) {
              remotePath = `${customer.outbound_amp}/${data[j].name}`;
              localPath = path.join(
                __dirname,
                "..",
                `files/${customer.name}/${key}/${data[j].name}`
              );
              await sftp.downloadFile(remotePath, localPath);
            }
            break;
          case "err":
            for (let k = 0; k < data.length; k++) {
              remotePath = `${customer.erreur_amp}/${data[k].name}`;
              localPath = path.join(
                __dirname,
                "..",
                `files/${customer.name}/${key}/${data[k].name}`
              );
              await sftp.downloadFile(remotePath, localPath);
            }
            break;
          case "arch":
            for (let l = 0; l < data.length; l++) {
              remotePath = `${customer.archive_amp}/${data[l].name}`;
              localPath = path.join(
                __dirname,
                "..",
                `files/${customer.name}/${key}/${data[l].name}`
              );
              await sftp.downloadFile(remotePath, localPath);
            }
            break;
          default:
            break;
        }
      }
    }
    sftp.disconnect();
  }
  return { ...customer, files };
};
const getRemoteInfo = async (customer, file_name, directory) => {
  const { outbound_amp, erreur_amp, archive_amp } = customer;

  const { SFTP_SERVER, SFTP_USER, SFTP_PASSWORD, SFTP_PORT } = process.env;
  let files = {
    out: [],
    err: [],
    arch: [],
  };
  //Connexion au server SFTP
  const sftp = new ClientSftp(SFTP_SERVER, SFTP_PORT, SFTP_USER, SFTP_PASSWORD);
  const { state, msg } = await sftp.connect();
  if (!state) {
    console.log({ Error: msg });
    sftp.disconnect();
  } else {
    files = {
      ...files,
      out: await sftp.list(`${outbound_amp}`),
      err: await sftp.list(`${erreur_amp}`),
      arch: await sftp.list(`${archive_amp}`),
    };
    //Save the files to the local filesystem

    let remotePath = "";
    let localPath = "";

    switch (directory) {
      case "out":
        remotePath = `${customer.outbound_amp}/${file_name}`;
        localPath = path.join(
          __dirname,
          "..",
          `files/${customer.name}/${directory}/${file_name}`
        );
        await sftp.downloadFile(remotePath, localPath);
        break;
      case "err":
        remotePath = `${customer.erreur_amp}/${file_name}`;
        localPath = path.join(
          __dirname,
          "..",
          `files/${customer.name}/${directory}/${file_name}`
        );
        await sftp.downloadFile(remotePath, localPath);
        break;
      case "arch":
        remotePath = `${customer.archive_amp}/${file_name}`;
        localPath = path.join(
          __dirname,
          "..",
          `files/${customer.name}/${directory}/${file_name}`
        );
        await sftp.downloadFile(remotePath, localPath);
        break;
      default:
        break;
    }

    sftp.disconnect();
  }
  console.log({ files });
  return {
    ...customer,
    files: files[directory]
      ? files[directory].filter((item) => item.name === file_name)
      : [],
  };
};
const putRemoteFiles = async (customer) => {
  const { inbound_amp, files } = customer;

  //Connexion au server SFTP Amplitude
  const { SFTP_SERVER, SFTP_USER, SFTP_PASSWORD, SFTP_FOLDER, SFTP_PORT } =
    process.env;

  try {
    const sftp = new ClientSftp(
      SFTP_SERVER,
      SFTP_PORT,
      SFTP_USER,
      SFTP_PASSWORD
    );

    const { state, msg } = await sftp.connect();

    if (!state) {
      console.log({ Error: msg });
      sftp.disconnect();
    } else {
      for (const key of Object.keys(files)) {
        const data = files[key];

        let localPath = "";
        if (data && data.length > 0) {
          switch (key) {
            case "in":
              for (let i = 0; i < data.length; i++) {
                localPath = path.join(
                  __dirname,
                  "..",
                  `files/${customer.name}/${key}/${data[i].name}`
                );
                const { state } = await sftp.uploadFile(
                  localPath,
                  inbound_amp + "/" + data[i].name
                );
                //Suppression du fichier dans le répertoire source
                if (state) {
                  console.log(`${customer.name} : ${data[i].name}`);
                  //Instatier la classe sftp
                  const sftp_customer = new ClientSftp(
                    customer.host,
                    customer.port,
                    customer.username,
                    customer.password
                  );
                  const response = await sftp_customer.connect();
                  if (!response.state) {
                    sftp_customer.disconnect();
                  } else {
                    const resp = await sftp_customer.deleteFile(
                      customer.inbound + "/" + data[i].name
                    );
                    console.log({
                      resp,
                      rep: customer.inbound + "/" + data[i].name,
                    });
                  }
                  sftp_customer.disconnect();
                }
              }
              break;
            default:
              break;
          }
        }
      }

      sftp.disconnect();
    }
  } catch (error) {
    console.error("Uploading failed:", error);
  }
};
const putRemoteFile = async (customer, file_name, directory) => {
  const { inbound_amp, files } = customer;

  //Connexion au server SFTP Amplitude
  const { SFTP_SERVER, SFTP_USER, SFTP_PASSWORD, SFTP_FOLDER, SFTP_PORT } =
    process.env;

  try {
    const sftp = new ClientSftp(
      SFTP_SERVER,
      SFTP_PORT,
      SFTP_USER,
      SFTP_PASSWORD
    );

    const { state, msg } = await sftp.connect();

    if (!state) {
      console.log({ Error: msg });
      sftp.disconnect();
    } else {
      let localPath = "";

      switch (directory) {
        case "in":
          localPath = path.join(
            __dirname,
            "..",
            `files/${customer.name}/${directory}/${file_name}`
          );
          const rep = await sftp.uploadFile(
            localPath,
            inbound_amp + "/" + file_name
          );
          //Suppression du fichier dans le répertoire source
          if (rep.state) {
            console.log(`${customer.name} : ${file_name}`);
            //Instatier la classe sftp
            const sftp_customer = new ClientSftp(
              customer.host,
              customer.port,
              customer.username,
              customer.password
            );
            const response = await sftp_customer.connect();
            if (!response.state) {
              sftp_customer.disconnect();
            } else {
              const resp = await sftp_customer.deleteFile(
                customer.inbound + "/" + file_name
              );
              console.log({
                resp,
                rep: customer.inbound + "/" + file_name,
              });
            }
            sftp_customer.disconnect();
          }
          break;

        default:
          break;
      }

      sftp.disconnect();
    }
  } catch (error) {
    console.error("Uploading failed:", error);
  }
};
const putCustomerRemoteFiles = async (customer) => {
  const {
    host,
    port,
    username,
    password,
    inbound,
    outbound,
    erreur,
    archive,
    response_slug,
    files,
  } = customer;
  //Connexion au server SFTP
  const sftp = new ClientSftp(host, port, username, password);
  const { state, msg } = await sftp.connect();

  if (!state) {
    sftp.disconnect();
  } else {
    for (const key of Object.keys(files)) {
      const data = files[key];
      let localPath = "";
      if (data && data.length > 0) {
        switch (key) {
          // case "in":
          //   for (let i = 0; i < data.length; i++) {
          //     localPath = path.join(
          //       __dirname,
          //       "..",
          //       `files/${customer.name}/${key}/${data[i].name}`
          //     );
          //     await sftp.uploadFile(localPath, inbound + "/" + data[i].name);
          //   }
          //   break;
          case "out":
            for (let j = 0; j < data.length; j++) {
              localPath = path.join(
                __dirname,
                "..",
                `files/${customer.name}/${key}/${data[j].name}`
              );
              await sftp.uploadFile(localPath, outbound + "/" + data[j].name);
            }
            break;
          case "err":
            for (let k = 0; k < data.length; k++) {
              localPath = path.join(
                __dirname,
                "..",
                `files/${customer.name}/${key}/${data[k].name}`
              );
              await sftp.uploadFile(localPath, erreur + "/" + data[k].name);
            }
            break;
          case "arch":
            for (let l = 0; l < data.length; l++) {
              localPath = path.join(
                __dirname,
                "..",
                `files/${customer.name}/${key}/${data[l].name}`
              );
              await sftp.uploadFile(localPath, archive + "/" + data[l].name);
            }
            break;
          default:
            break;
        }
      }
    }
    sftp.disconnect();
  }
};
const putCustomerRemoteFile = async (customer, file_name, directory) => {
  const {
    host,
    port,
    username,
    password,
    outbound,
    erreur,
    archive,
    response_slug,
    files,
  } = customer;
  //Connexion au server SFTP
  const sftp = new ClientSftp(host, port, username, password);
  const { state, msg } = await sftp.connect();

  if (!state) {
    sftp.disconnect();
  } else {
    let localPath = "";

    switch (directory) {
      case "out":
        localPath = path.join(
          __dirname,
          "..",
          `files/${customer.name}/${directory}/${file_name}`
        );
        await sftp.uploadFile(localPath, outbound + "/" + file_name);
        break;
      case "err":
        localPath = path.join(
          __dirname,
          "..",
          `files/${customer.name}/${directory}/${file_name}`
        );
        await sftp.uploadFile(localPath, erreur + "/" + file_name);
        break;
      case "arch":
        localPath = path.join(
          __dirname,
          "..",
          `files/${customer.name}/${directory}/${file_name}`
        );
        await sftp.uploadFile(localPath, archive + "/" + file_name);
        break;
      default:
        break;
    }

    sftp.disconnect();
  }
};
const downLoadCustomersFiles = async (customers) => {
  try {
    let list = [];
    for (i = 0; i < customers.length; i++) {
      const newData = await getRemoteCustomerInfos(customers[i]);
      list[i] = {
        ...newData.dataValues,
        files: newData.files,
        User: newData.dataValues.User.dataValues,
      };
    }
    return list;
  } catch (error) {
    console.log(`Erreur : ${error}`);
  }
};
const downLoadCustomerFile = async (customer, file_name, directory) => {
  try {
    let list = [];
    const newData = await getRemoteCustomerInfo(
      customer[0],
      file_name,
      directory
    );
    list[0] = {
      ...newData.dataValues,
      files: newData.files,
    };

    return list;
  } catch (error) {
    console.log(`Erreur : ${error}`);
  }
};
const uploadFilesToAmplAccount = async (customers) => {
  try {
    for (i = 0; i < customers.length; i++) {
      await putRemoteFiles(customers[i]);
    }
  } catch (error) {
    console.log(`Erreur : ${error}`);
  }
};
const uploadFileToAmplAccount = async (customer, file_name, directory) => {
  try {
    await putRemoteFile(customer[0], file_name, directory);
  } catch (error) {
    console.log(`Erreur : ${error}`);
  }
};
const uploadFilesToCustomerAccount = async (customers) => {
  try {
    for (i = 0; i < customers.length; i++) {
      await putCustomerRemoteFiles(customers[i]);
    }
  } catch (error) {
    console.log(
      `Error for upload the files to the Customer Account : ${error}`
    );
  }
};
const uploadFileToCustomerAccount = async (customer, file_name, directory) => {
  try {
    await putCustomerRemoteFile(customer[0], file_name, directory);
  } catch (error) {
    console.log(
      `Error for upload  ${file_name} file to the Customer Account : ${error}`
    );
  }
};
const downLoadFiles = async (customers) => {
  try {
    let list = [];
    for (i = 0; i < customers.length; i++) {
      const newData = await getRemoteInfos(customers[i].dataValues);

      list[i] = {
        ...newData,
        files: newData.files,
        User: newData.User.dataValues,
      };
    }
    return list;
  } catch (error) {
    console.log(`Erreur : ${error}`);
  }
};
const downLoadFile = async (customer, file_name, directory) => {
  try {
    let list = [];

    const newData = await getRemoteInfo(customer[0], file_name, directory);

    list[0] = {
      ...newData.dataValues,
      files: newData.files,
    };

    return list;
  } catch (error) {
    console.log(`Erreur : ${error}`);
  }
};
const selfValidation = async (customer, file_name, directory) => {
  let newCustomer = [];
  let newCustomersAmplitude = [];
  if (directory === "in") {
    //Envoie d'un fichier du répertoire inbound du client vers celui d'amplitude
    //1. Stockage du fichier dans le répertoire local
    newCustomer = await downLoadCustomerFile(customer, file_name, directory);
    //2. Upload du fichier vers le compte SFTP d'Amplitude
    await uploadFileToAmplAccount(newCustomer, file_name, directory);
  } else if (
    directory === "out" ||
    directory === "err" ||
    directory === "arch"
  ) {
    //1. Stockage en local du fichier venu du compte SFTP Amplitude du client
    newCustomersAmplitude = await downLoadFile(customer, file_name, directory);

    // 2. Upload du fichier vers le compte SFTP du client
    await uploadFileToCustomerAccount(
      newCustomersAmplitude,
      file_name,
      directory
    );
  }
  return newCustomersAmplitude;
};


module.exports = {
  getAllCustomers,
  getRemoteCustomerInfos,
  getCustomerRemoteFiles,
  getCbsRemoteFiles,
  downLoadCustomersFiles,
  downLoadFiles,
  uploadFilesToAmplAccount,
  uploadFilesToCustomerAccount,
  selfValidation,
  downLoadCustomerFile,
};
