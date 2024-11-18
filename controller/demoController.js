const Demo =require('../Modal/demoModal')

// Validation helper
const validateEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
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

        // // Log the created timestamp in the user's time zone
        // console.log('Demo created at (user time zone):', 
        //     demoRequest.createdAt.toLocaleString('en-US', { 
        //         timeZone: data.timeZone,
        //         hour12: false 
        //     })
        // );

        return res.status(201).json({
            message: 'Demo scheduled successfully',
            data: demoRequest
        });

    } catch (error) {
        console.error('Error scheduling demo:', error);
        return res.status(500).json({
            error: error.message || 'Error scheduling demo'
        });
    }
};

module.exports={scheduleDemoController}