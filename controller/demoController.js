const Demo = require("../Modal/demoModal");
const sgMail = require("@sendgrid/mail");

// Optimize SendGrid initialization
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Memoize validation functions
const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const scheduleDemoController = async (req, res) => {
  try {
    const data = req.body;

    // Fast validation with early returns
    const requiredFields = [
      "firstName",
      "lastName",
      "jobTitle",
      "companyName",
      "email",
      "date",
      "timeZone",
      "usesLLM",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    if (!validateEmail(data.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Simplified time parsing
    const userDateTime = new Date(data.date);

    // Use Promise.all for concurrent operations
    const [demoRequest] = await Promise.all([
      Demo.create({
        ...data,
        date: userDateTime,
      }),
      // Optional: Send email concurrently
      sgMail
        .send({
          to: data.email,
          from: process.env.FROM_EMAIL,
          subject: "Demo Session Request",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2>Demo Session Request Received</h2>
            <p>Dear ${data.firstName} ${data.lastName},</p>
            <p>Thank you for scheduling a demo session with us. Your demo request has been successfully received.</p>
            <p>Your demo is scheduled for ${userDateTime.toLocaleString()}.</p>
          </div>

        `,
        })
        .catch(console.error), // Log email errors without blocking
    ]);

    return res.status(201).json({
      message: "Demo scheduled successfully",
      data: demoRequest,
    });
  } catch (error) {
    console.error("Demo scheduling error:", error);
    return res.status(500).json({
      error: "Error scheduling demo",
    });
  }
};

module.exports = { scheduleDemoController };
