const Demo = require("../Modal/demoModal");
const sgMail = require("@sendgrid/mail");

// Optimize SendGrid initialization
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Memoize validation functions
const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

// Validate timezone format
const validateTimeZone = (timeZone) => {
  try {
    // Test if timezone is valid by attempting to format a date with it
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch (e) {
    return false;
  }
};

// Admin email template
const getAdminEmailHTML = (userData, dateTime) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>New Demo Session Request</h2>
    <p>A new demo session has been requested with the following details:</p>
    <ul>
      <li>Name: ${userData.firstName} ${userData.lastName}</li>
      <li>Email: ${userData.email}</li>
      <li>Company: ${userData.companyName}</li>
      <li>Job Title: ${userData.jobTitle}</li>
      <li>Date & Time: ${dateTime.toLocaleString()}</li>
      <li>Time Zone: ${userData.timeZone}</li>
      <li>Uses LLM: ${userData.usesLLM ? 'Yes' : 'No'}</li>
    </ul>
  </div>
`;

// User confirmation email template
const getUserEmailHTML = (userData, dateTime) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Demo Session Request</h2>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <p>Dear ${data.firstName} ${data.lastName},</p>
            <p>Thank you for scheduling a demo session with us. Your demo request has been successfully received.</p>
            <p>Your demo is scheduled for ${userDateTime.toLocaleString()}.</p>
          </div>
  </div>
`;

const scheduleDemoController = async (req, res) => {
  try {
    const data = req.body;

    // Validate required fields with more descriptive error messages
    const requiredFields = [
      { key: "firstName", message: "First name is required" },
      { key: "lastName", message: "Last name is required" },
      { key: "jobTitle", message: "Job title is required" },
      { key: "companyName", message: "Company name is required" },
      { key: "email", message: "Email address is required" },
      { key: "date", message: "Demo date and time is required" },
      { key: "timeZone", message: "Time zone is required (e.g., 'America/New_York', 'Europe/London')" },
      { key: "usesLLM", message: "LLM usage information is required" }
    ];

    // Check for missing required fields
    for (const field of requiredFields) {
      if (!data[field.key]) {
        return res.status(400).json({ 
          error: field.message,
          field: field.key
        });
      }
    }

    // Validate email format
    if (!validateEmail(data.email)) {
      return res.status(400).json({ 
        error: "Invalid email format",
        field: "email"
      });
    }

    // Validate timezone
    if (!validateTimeZone(data.timeZone)) {
      return res.status(400).json({ 
        error: "Invalid time zone format. Please use IANA time zone names (e.g., 'America/New_York', 'Europe/London')",
        field: "timeZone"
      });
    }

    // Parse and validate date
    const userDateTime = new Date(data.date);
    if (isNaN(userDateTime.getTime())) {
      return res.status(400).json({ 
        error: "Invalid date format. Please provide a valid date and time",
        field: "date"
      });
    }

    // Prepare email messages
    const userEmail = {
      to: data.email,
      from: process.env.FROM_EMAIL,
      subject: "Demo Session Request",
      html: getUserEmailHTML(data, userDateTime),
    };

    const adminEmail = {
      to: process.env.ADMIN_EMAILS?.split(',').filter(Boolean) || [], // Filter out empty strings
      from: process.env.FROM_EMAIL,
      subject: `New Demo Request - ${data.firstName} ${data.lastName}`,
      html: getAdminEmailHTML(data, userDateTime),
    };

    // Use Promise.all for concurrent operations
    const [demoRequest] = await Promise.all([
      Demo.create({
        ...data,
        date: userDateTime,
      }),
      // Send both emails concurrently
      Promise.all([
        sgMail.send(userEmail),
        // Only send admin email if ADMIN_EMAILS is configured
        adminEmail.to.length > 0 ? sgMail.send(adminEmail) : Promise.resolve(),
      ]).catch(error => {
        console.error("Email sending error:", error);
        // Continue execution even if email fails
      }),
    ]);

    return res.status(201).json({
      message: "Demo scheduled successfully",
      data: demoRequest,
    });
  } catch (error) {
    console.error("Demo scheduling error:", error);
    return res.status(500).json({
      error: "Error scheduling demo",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { scheduleDemoController };