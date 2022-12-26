const { parentPort } = require("worker_threads");
const { getAllCustomers } = require("../utils/cronTasks");

parentPort.on("message", async (msg) => {
  
  let customers = [];
  if (typeof msg === "string" && msg === "all_customers") {
    customers = await getAllCustomers();
    console.log({ client: customers });
  }
  parentPort.postMessage(customers);
});
