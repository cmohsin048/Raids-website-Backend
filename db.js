const mongoose = require("mongoose");

const connectdb = (url) => {
  if (!url) {
    throw new Error("MongoDB URI is not defined");
  }
  return mongoose.connect(url);
};

module.exports = connectdb;