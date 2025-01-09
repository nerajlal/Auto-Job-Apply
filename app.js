const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const path = require('path'); // Add this to handle file paths

// Route for the root path '/'
app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

app.get('/sendemail', (req, res) => {
  res.send("hello");
  console.log("sendinforeq called");
  const user = "lensikoviski@gmail.com";
  const password = "qnhd oopy fdsy elez";
  
  const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: user,
      pass: password
    }
  });

  // Assuming the PDF is in the same directory as your server file
  const pdfPath = path.join(__dirname, 'dummy.pdf');

  try {
    transport.sendMail({
      from: user,
      to: "nerajnerajlal@gmail.com",
      subject: "Information Request for Property",
      html: `
        <p>Dear Property Owner,</p>
        <p>You have received a request for more information about the property <strong>
        </strong> from:</p>
        <ul>
          <li>Name: </li>
          <li>Email: </li>
          <li>Phone Number: </li>
        </ul>
        <p>Here's the message from the client:</p>
        <p></p><br><br>
        <p>Please contact them at your earliest convenience.</p>
        <p>Thank you,</p>
        <p>Your Real Estate Website Team</p>
      `,
      attachments: [{
        filename: 'dummy.pdf',
        path: pdfPath
      }]
    });
    console.log("message sent with attachment");
  } catch (error) {
    console.log("error is:", error);
  }
});