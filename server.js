const express = require("express");
const cors = require("cors");
const AfricasTalking = require('africastalking');
const moment = require('moment');
const schedule = require('node-schedule');
require('dotenv').config();

// Initialize Africa's Talking
const africastalking = AfricasTalking({
    apiKey: process.env.API_KEY,
    username: 'africasmsApp'
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true}));

// Parse the date and time from the incoming SMS message
function parseDateTimeFromSMS(text) {
    const dateTimeRegex = /(\d{1,2}(?:st|nd|rd|th) \w+ \d{4} at \d{1,2}:\d{2} [APap][Mm])/;
    const dateTimeMatch = text.match(dateTimeRegex);

    if (!dateTimeMatch) {
        return null;
    }

    return moment(dateTimeMatch[0], "Do MMMM YYYY [at] h:mm A");
}

// Schedule an SMS reminder
function scheduleReminder(reminderDateTime, venue, recipient, originalMessage) {
    const scheduledDate = new Date(reminderDateTime);

    const job = schedule.scheduleJob(scheduledDate, async () => {
        try {
            const result = await africastalking.SMS.send({
                to: recipient,
                message: `Reminder: ${originalMessage} at ${venue}`
            });

            console.log({ result });
        } catch (error) {
            console.error("Error sending SMS", error);
        }
    });

    console.log(`Reminder scheduled for ${scheduledDate} with message: ${originalMessage}`);
}

// Handle incoming SMS messages
app.post('/twowaycallback', async (req, res) => {
    const { text, from } = req.body;
    console.log(req.body)

    if (!text || !from) {
        return res.status(400).json({ error: "Invalid request format" });
    }

    const reminderDateTime = parseDateTimeFromSMS(text);

    if (!reminderDateTime) {
        return res.status(400).json({ error: "Invalid date and time format" });
    }

    const venueRegex = /on (.+)/;
    const venueMatch = text.match(venueRegex);
    const venue = venueMatch ? venueMatch[1] : "";

    const formattedReminderDateTime = reminderDateTime.format("YYYY-MM-DD HH:mm:ss");
    
    // Schedule the SMS reminder
    scheduleReminder(formattedReminderDateTime, venue, from, text);

    res.send('Received');
});

app.listen(8800, () => {
    console.log("Server running on port 8800");
});
