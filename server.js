require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const options = {
  origin: "*",
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(options));

//Routes
app.use("/api/v1/user", require("./routes/userRoute"));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
