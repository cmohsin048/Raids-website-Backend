const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./db");
const routes = require("./Route/Routes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.use(express.json());

// Define your routes
app.use("/", routes);

// app.use(express.static(path.join(__dirname, "./main_app")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "./main_app", "index.html"));
// });

const start = async () => {
  try {
    // console.log("Mongo URI:", process.env.MONGO_URI); // Check if this prints the correct URI
    await db(process.env.MONGO_URI);
    app.listen(port, () => console.log(`App is running on port : ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();