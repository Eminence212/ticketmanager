const { Worker } = require("worker_threads");
const {
  getAllCustomers,
  getRemoteCustomerInfos,
  formatCustomers,
} = require("./cronTasks");

const allCustomerWorker = new Worker("./workers/allCustomerWorkers.js");

const main = async () => {
  console.log(`Début traitement : ${new Date().toISOString()}`);
  try {
    //Récupération des clients
    let newCustomers = [];
    const customers = await getAllCustomers();
    newCustomers = await formatCustomers(customers);
    console.log({ newCustomers });
  } catch (error) {
    console.error(error);
  }

  console.log(`Fin traitement : ${new Date().toISOString()}`);
};
module.exports = main;
