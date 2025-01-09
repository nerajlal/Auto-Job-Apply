const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const path = require('path'); // Add this to handle file paths
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());  // Add this line to your backend if not already present
 
// Route for the root path '/'
app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});



app.post('/sendemail', (req, res) => {
  res.send("hello");
  console.log("sendinforeq called");
  console.log(req.body)
  const user = "lensikoviski@gmail.com";
  const password = "qnhd oopy fdsy elez";//lensikoviski
  //const password1 = "bpzy kcah zxgx yobr" //neeraj
  
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
      to: req.body.hrEmail,
      subject: `Application for ${req.body.position} Position at ${req.body.companyName}`,
      html: `
        <p>Dear Hiring Team at ${req.body.companyName},</p>

        <p>I am writing to express my strong interest in the ${req.body.position} position at ${req.body.companyName}. With a strong foundation in Java and extensive experience in MERN stack development, I am excited about the opportunity to contribute to your team.</p>

        <p>During my internship at Igoraza Pvt Ltd, I played a key role in developing a comprehensive platform for automobile and real estate sales, demonstrating my proficiency in React and modern frontend development. My experience includes implementing features like user authentication, email verification, and database management using Node.js, Express, and MongoDB.</p>

        <p>Currently pursuing Java Full Stack Development at Qspiders, I've strengthened my expertise in Object-Oriented Programming and various frameworks. My technical skills include:</p>
        <ul>
          <li>Programming: Java, JavaScript (ReactJS), HTML/CSS</li>
          <li>Frameworks: ExpressJS, Bootstrap, Material UI, Tailwind CSS</li>
          <li>Databases: MongoDB, SQL, PostgreSQL</li>
          <li>Tools: Eclipse, VScode, Git(GitHub), Postman</li>
        </ul>

        <p>I am particularly drawn to this opportunity at ${req.body.companyName} and am confident that my technical skills and enthusiasm for learning would make me a valuable addition to your team.</p>

        <p>I look forward to discussing how I can contribute to your organization in more detail.</p>

        <p>Thank you for considering my application.</p>

        <p>Best regards,<br>
        Jayaram S Kumar<br>
        +917907144673<br>
        kumarjayaram545@gmail.com<br>
        LinkedIn: jayaram-s-kumar-48607920b</p>
      `,
      attachments:[{
        filename: `${req.body.position}.pdf`,
        path: path.join(__dirname, `/resumes/${req.body.position}.pdf`)
      }]
    });
    console.log("message sent with attachment");
  } catch (error) {
    console.log("error is:", error);
  }
});