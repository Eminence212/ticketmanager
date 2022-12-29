const { User, Customer, sequelize } = require("../models");
const { decriptString, criptString } = require("./criptograph");
const ClientSftp = require("./ClientSftp");
const path = require("path");
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
    out: [],
    err: [],
    arch: [],
  };

  //Connexion au server SFTP
  const sftp = new ClientSftp(host, port, username, password);

  const { state, msg } = await sftp.connect();

  if (!state) {
    sftp.disconnect();
  } else {
    files = {
      ...files,
      in: await sftp.listFiles(`.${inbound}`),
      out: await sftp.listFiles(`.${outbound}`),
      err: await sftp.listFiles(`.${erreur}`),
      arch: await sftp.listFiles(`.${archive}`),
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
          case "out":
            for (let j = 0; j < data.length; j++) {
              remotePath = `${customer.outbound}/${data[j].name}`;
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
              remotePath = `${customer.erreur}/${data[k].name}`;
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
              remotePath = `${customer.archive}/${data[l].name}`;
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
const getRemoteInfos = async (customer) => {
  const { inbound_amp, outbound_amp, erreur_amp, archive_amp } = customer;
  const { SFTP_SERVER, SFTP_USER, SFTP_PASSWORD, SFTP_FOLDER, SFTP_PORT } =
    process.env;
  let files = {
    in: [],
    out: [],
    err: [],
    arch: [],
  };
  //Connexion au server SFTP
  const sftp = new ClientSftp(
    SFTP_SERVER,
    SFTP_PORT,
    SFTP_USER,
    criptString(SFTP_PASSWORD)
  );
  const { state, msg } = await sftp.connect();
  if (!state) {
    sftp.disconnect();
  } else {
    files = {
      ...files,
      in: await sftp.listFiles(`${inbound_amp}`),
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
          case "in":
            for (let i = 0; i < data.length; i++) {
              remotePath = `${customer.inbound_amp}/${data[i].name}`;
              localPath = path.join(
                __dirname,
                "..",
                `files/${customer.name}/${key}/${data[i].name}`
              );
              await sftp.downloadFile(remotePath, localPath);
            }
            break;
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
const putRemoteFiles = async (customer) => {
  const { inbound_amp, outbound_amp, erreur_amp, archive_amp, files } =
    customer;

  //Connexion au server SFTP Amplitude
  const { SFTP_SERVER, SFTP_USER, SFTP_PASSWORD, SFTP_FOLDER, SFTP_PORT } =
    process.env;

  try {
    const sftp = new ClientSftp(
      SFTP_SERVER,
      SFTP_PORT,
      SFTP_USER,
      criptString(SFTP_PASSWORD)
    );

    const { state, msg } = await sftp.connect();

    if (!state) {
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
                await sftp.uploadFile(
                  localPath,
                  inbound_amp + "/" + data[i].name
                );
              }
              break;
            case "out":
              for (let j = 0; j < data.length; j++) {
                localPath = path.join(
                  __dirname,
                  "..",
                  `files/${customer.name}/${key}/${data[j].name}`
                );
                await sftp.uploadFile(
                  localPath,
                  outbound_amp + "/" + data[j].name
                );
              }
              break;
            case "err":
              for (let k = 0; k < data.length; k++) {
                localPath = path.join(
                  __dirname,
                  "..",
                  `files/${customer.name}/${key}/${data[k].name}`
                );
                await sftp.uploadFile(
                  localPath,
                  erreur_amp + "/" + data[k].name
                );
              }
              break;
            case "arch":
              for (let l = 0; l < data.length; l++) {
                localPath = path.join(
                  __dirname,
                  "..",
                  `files/${customer.name}/${key}/${data[l].name}`
                );
                await sftp.uploadFile(
                  localPath,
                  archive_amp + "/" + data[l].name
                );
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
          case "in":
            for (let i = 0; i < data.length; i++) {
              localPath = path.join(
                __dirname,
                "..",
                `files/${customer.name}/${key}/${data[i].name}`
              );
              await sftp.uploadFile(localPath, inbound + "/" + data[i].name);
            }
            break;
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
const uploadFilesToAmplAccount = async (customers) => {
  try {
    for (i = 0; i < customers.length; i++) {
      await putRemoteFiles(customers[i]);
    }
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
    console.log(`Erreur : ${error}`);
  }
};
const downLoadFiles = async (customers) => {
  try {
    let list = [];
    for (i = 0; i < customers.length; i++) {
      const newData = await getRemoteInfos(customers[i]);
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

module.exports = {
  getAllCustomers,
  getRemoteCustomerInfos,
  downLoadCustomersFiles,
  downLoadFiles,
  uploadFilesToAmplAccount,
  uploadFilesToCustomerAccount,
};
