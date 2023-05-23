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
app.use("/api/v1/place", require("./routes/placeRoute"));
app.use("/api/v1/evenement", require("./routes/evenementRoute"));
app.use("/api/v1/participant", require("./routes/participantRoute"));
app.use("/api/v1/participation", require("./routes/participationRoute"));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
