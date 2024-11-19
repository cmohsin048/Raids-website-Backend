const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./db");
const routes = require("./Route/Routes");

const app = express();
const port = process.env.PORT || 3000;

// Updated CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://raidsai.ai', // Add your production domain
    // Add any other domains that need access
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false
};

// Apply cors before other middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

app.use(bodyParser.json());
app.use(express.json());

// Add headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(routes);

// Enhanced error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
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
