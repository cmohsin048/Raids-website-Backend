const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./db");
const routes = require("./Route/Routes");

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  };
  
  // Middleware
  app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

// Remove the extra slash in routes
app.use(routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const start = async () => {
  try {
    await db(process.env.MONGO_URI);
    app.listen(port, () => console.log(`App is running on port : ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();

// Export for Vercel
module.exports = app;