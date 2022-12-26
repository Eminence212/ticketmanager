const { User, Customer, sequelize } = require("../models");
const { decriptString } = require("./criptograph");
const ClientSftp = require("./ClientSftp");
const getAllCustomers = async () => {
  const customers = await Customer.findAll({
    where: { autovalidation: true, enable: true },
    attributes: [
      "id",
      "name",
      "username",
      "inbound",
      "outbound",
      "erreur",
      "archive",
      "host",
      "port",
      "enable",
      "autovalidation",
      "password",
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

    sftp.disconnect();
  }
  return { ...customer, files };
};
const formatCustomers = async (customers) => {
  try {
    let list = [];
    for (i = 0; i < customers.length; i++) {
      list[i] = await getRemoteCustomerInfos(customers[i]);
    }
    return list;
  } catch (error) {
    console.log(`Erreur : ${error}`);
  }
};

module.exports = { getAllCustomers, getRemoteCustomerInfos, formatCustomers };
