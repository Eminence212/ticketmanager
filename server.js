require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const { getAllCustomers } = require("./utils/cronTasks");
const main = require("./utils/mainTasks");
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//Routes
app.use("/api/v1/user", require("./routes/userRoute"));
app.use("/api/v1/customer", require("./routes/customerRoute"));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  require("events").defaultMaxListeners = 0;
  cron.schedule(`*/10 * * * * *`, () => main());
});
