const mongoose = require("mongoose"); 

const DemoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    validate: {
      validator: function(v) {
        return /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/.test(v);
      },
      message: props => `${props.value} is not a valid time format!`
    }
  },
  timeZone: {
    type: String,
    required: [true, 'Time zone is required'],
  },
  usesLLM: {
    type: String,
    required: [true, 'LLM usage information is required'],
    enum: ['yes', 'no'],
  },
  concerns: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: function() {
      // Create a new Date object in the user's local time zone
      return new Date().toLocaleString('en-US', { timeZone: this.timeZone });
    },
  },
});

const Demo = mongoose.model("Demo", DemoSchema);
module.exports = Demo;