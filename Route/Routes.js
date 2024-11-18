
const express = require("express");
const Router = express.Router();
const {scheduleDemoController}=require('../controller/demoController')

Router.post('/schedule-demo', scheduleDemoController);

module.exports = Router;