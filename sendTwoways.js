const credentials = {
    apiKey: process.env.API_KEY,
    username: 'africasmsApp',
  };
  
  // Initialize the SDK
  const AfricasTalking = require('africastalking')(credentials);
  
  // Get the SMS service
  const sms = AfricasTalking.SMS;
  
  function sendTwoWaySMS({ message, recipient }) {
    const options = {
      // Set the numbers you want to send to in international format
      to: recipient,
      // Set your message
      message,
      from: '53137',
  
    }
  
    console.log({ options })
    // That’s it, hit send and we’ll take care of the rest
    sms.send(options)
      .then(console.log)
      .catch(console.error);
  }
  
  module.exports = sendTwoWaySMS