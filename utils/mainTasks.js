const { Worker } = require("worker_threads");
const {
  getAllCustomers,
  downLoadCustomersFiles,
  uploadFilesToAmplAccount,
  uploadFilesToCustomerAccount,
  downLoadFiles,
} = require("./cronTasks");

const main = async () => {
  console.log(`Début traitement : ${new Date().toISOString()}`);
  let newCustomers = [];
  let newCustomersAmplitude = [];
  try {
    //Récupération des clients
    const customers = await getAllCustomers();
    //Stockage en local des fichiers venus des comptes SFTP des clients
    newCustomers = await downLoadCustomersFiles(customers);
    
    //Upload des fichiers vers le compte SFTP d'Amplitude pour chaque client
    await uploadFilesToAmplAccount(newCustomers);

    //Stockage en local des fichiers venus des comptes SFTP Amplitude
    newCustomersAmplitude = await downLoadFiles(customers);
  
    // //Upload des fichiers vers les comptes SFTP des clients
    await uploadFilesToCustomerAccount(newCustomersAmplitude);
  } catch (error) {
    console.error(error);
  }
  console.log(`Fin traitement : ${new Date().toISOString()}`);
};
module.exports = main;
