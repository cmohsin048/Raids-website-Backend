const Demo = require('../Modal/demoModal');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Validation helper
const validateEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
};

// Format date for email
const formatDate = (date, timeZone) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timeZone
    });
};

// Main controller function
const scheduleDemoController = async (req, res) => {
    try {
        const data = req.body;

        // Validate required fields
        const requiredFields = [
            'firstName',
            'lastName',
            'jobTitle',
            'companyName',
            'email',
            'date',
            'time',
            'timeZone',
            'usesLLM'
        ];

        for (const field of requiredFields) {
            if (!data[field]) {
                return res.status(400).json({
                    error: `${field} is required`
                });
            }
        }

        // Validate email format
        if (!validateEmail(data.email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        // Parse time with AM/PM
        const [time, period] = data.time.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        // Convert to 24-hour format
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        // Create a date in the user's time zone
        const userDateTime = new Date(
            `${data.date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
        );

        // Create demo request in database
        const demoRequest = await Demo.create({
            firstName: data.firstName,
            lastName: data.lastName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            email: data.email,
            date: userDateTime,
            time: `${time} ${period}`,
            timeZone: data.timeZone,
            usesLLM: data.usesLLM,
            concerns: data.concerns || ''
        });

        // Send confirmation email
        const msg = {
            to: data.email,
            from: process.env.FROM_EMAIL,
            subject: 'Demo Session Confirmation',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2>Demo Session Confirmation</h2>
                    
                    <p>Dear ${data.firstName} ${data.lastName},</p>
                    
                    <p>Thank you for scheduling a demo session with us. Your demo has been successfully scheduled.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Demo Details:</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li><strong>Date:</strong> ${formatDate(userDateTime, data.timeZone)}</li>
                            <li><strong>Time:</strong> ${data.time} (${data.timeZone})</li>
                            <li><strong>Company:</strong> ${data.companyName}</li>
                            <li><strong>Job Title:</strong> ${data.jobTitle}</li>
                        </ul>
                    </div>

                    <p>What to expect:</p>
                    <ul>
                        <li>The demo session will be conducted virtually</li>
                        <li>You'll receive a calendar invitation with meeting details separately</li>
                        <li>The session will last approximately 1 hour</li>
                    </ul>

                    <p>If you need to reschedule or have any questions, please contact our support team.</p>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 12px;">
                            This is an automated confirmation email. Please do not reply to this message.
                        </p>
                    </div>
                </div>
            `
        };

        try {
            await sgMail.send(msg);
            return res.status(201).json({
                message: 'Demo scheduled successfully and confirmation email sent',
                data: demoRequest
            });
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Still return success but with a warning
            return res.status(201).json({
                message: 'Demo scheduled successfully but confirmation email failed to send',
                data: demoRequest,
                emailError: true
            });
        }

    } catch (error) {
        console.error('Error scheduling demo:', error);
        return res.status(500).json({
            error: error.message || 'Error scheduling demo'
        });
    }
};

module.exports = { scheduleDemoController };