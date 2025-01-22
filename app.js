const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const path = require('path'); // Add this to handle file paths
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs').promises;


app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");


const genAI = new GoogleGenerativeAI("AIzaSyBXYg7zBKkGBDZhfMbPi92YgTbTyrC78zk");
const fileManager = new GoogleAIFileManager("AIzaSyBXYg7zBKkGBDZhfMbPi92YgTbTyrC78zk");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });




const createJobEmail = async (posterFile) => {
  const selfPrompt = `I am Neraj Lal S, a technology professional with expertise across multiple roles including Java 
  Development, Software Engineering, and Web Development. I hold an MCA from Sree Narayana Institute of Technology
   (2022-2024) and a BSc in Computer Science from IHRD College of Applied Science (2019-2022), both under the University
    of Kerala. My technical skills span multiple programming languages including PHP, Java, JavaScript, HTML, CSS,
     Bootstrap, Python, and Machine Learning. I'm proficient in database management systems like MySQL, MongoDB, 
     and MySQLi, and have experience with frameworks such as Django (Python) and React. My professional experience
      includes working as a Web Developer (PHP) at Serve Techno Research Kollam (2022-2024) where I developed and
       maintained web applications using PHP and ML, and I completed a Java Internship (2024-2025). I have completed
        several notable projects including "Serve The Needy" (a MERN stack project for food donation), "Farming Assistant" 
        (a PHP-based agricultural e-commerce platform), and "Social Welfare" (a Django-based charity management system).
         I have also undertaken self-learning projects including an E-commerce system with Product Recommendation, 
         Sentiment Analysis in Product Reviews, a Matrimony Site, Resume Builder, E-learning Platform, and Inventory
          Management System. My achievements include being a Devtown campus ambassador, Google developer students club member,
           Microsoft learn student ambassador, and winning first prize in a 24-hour hackathon conducted by IEDC. I hold certificates
            in Responsive Web Designing from Freecodecamp, HTML5 and CSS3 from Pirple, and Machine Learning with 
            Python from Freecodecamp. I maintain an active presence on GitHub (github.com/nerajlal), have a professional 
            profile at gecnoguru.com/Nerajlal, and can be reached at nerajnerajlal@gmail.com or +91 8547470675. My current
             interests include exploring new web development frameworks and technologies, MERN stack development, Android
              development, machine learning applications, and modern JavaScript frameworks.`


  try {
    // Create a temporary file path
    console.log("posterfile is,", posterFile)
    const tempPath = path.join(__dirname, `temp-${Date.now()}-${posterFile.originalname}`);

    // Write the buffer to a temporary file
    await fs.writeFile(tempPath, posterFile.buffer);

    // Now use the file path
    const uploadResult = await fileManager.uploadFile(
      tempPath,
      {
        mimeType: posterFile.mimetype,
        displayName: posterFile.originalname,
      },
    );

    // Delete the temporary file after upload
    await fs.unlink(tempPath);

    console.log(
      `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
    );

    const result = await model.generateContent([
      `This is a job poster.You must respond with a valid JSON string and nothing else. Do not include any explanations, backticks, or markdown formatting. 
       The response must be parseable by JSON.parse() and follow this exact structure:
       {"hrEmail":"email@example.com","subject":"Job Application Subject","jobPosition":"Job position here",
       "company":"The name of the company here"}
       ${selfPrompt}`,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },

      },
    ]);

    let cleanedRes = result.response.text().replace(/`/g, "").replace(/json/g, "");
    console.log("cleanedRes : ", cleanedRes)
    let cleanedJsonRes = JSON.parse(cleanedRes)
    console.log("cleanedJsonRes is:", cleanedJsonRes)

    return cleanedJsonRes

  } catch (error) {
    console.log("error in createJobEmail function");
    console.error(error);
    throw error; // Re-throw the error for proper error handling upstream
  }
}



// Route for the root path '/'
app.get('/', async (req, res) => {

  res.send('Hello from Express server!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on PORT: ', PORT);
});

app.post('/poster', upload.single('posterImage'), async (req, res) => {
  const myEmailObj = await createJobEmail(req.file);
  res.json({
    success: true,
    myEmailObj
  });
})

app.post('/sendemail', upload.single('posterImage'), async (req, res) => {
  console.log("Send email request received:", req.body);


  // Email configuration
  const user = "nerajnerajlal@gmail.com";
  const password = "bpzy kcah zxgx yobr";
  // const user = "kumarjayaram545@gmail.com"
  // const password = "nmop tcvs kalx tvjc"

  const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: user,
      pass: password
    }
  });

  const myEmailObj = req.body;
  console.log("myEmailObj is", myEmailObj)
  // Verify SMTP connection
  try {
    await transport.verify();
  } catch (error) {
    console.error("SMTP Connection Error:", error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to connect to email server',
      error: error.message
    });
  }

  // Prepare email content
  const emailContent = {
    from: user,
    // to: myEmailObj.hrEmail,
    to: "kumarjayaram545@gmail.com",
    subject: myEmailObj.subject,
    html: `<p>Dear Hiring Team at ${myEmailObj.company},</p>

<p>I am excited to apply for the ${myEmailObj.jobPosition} position at your esteemed organization. With a solid foundation and combined with a keen understanding of front-end and back-end development, I am eager to contribute to ${myEmailObj.company}'s innovative projects.</p>

<p>My hands-on experience includes creating dynamic web applications and working collaboratively in team environments. I am confident that my technical skills and enthusiasm for learning will enable me to excel in this role.</p>

<p>I look forward to the opportunity to discuss how my skills and aspirations align with your team's goals.</p>

<p>I have attached my resume for your review and would welcome the opportunity to discuss how my skills and experiences align with your team's goals.</p>

<p>Thank you for considering my application, and I look forward to the possibility of contributing to ${myEmailObj.company}'s success.</p>

<p>Best regards,<br>
Neraj Lal S<br>
Phone: +91 8547470675<br>
Email: nerajnerajlal@gmail.com</p>`,
    attachments: [{
      filename: `${myEmailObj.resume}.pdf`,
      path: path.join(__dirname, `resumes/${myEmailObj.resume}.pdf`)
    }]
  };

  console.log("emailContent is ", emailContent)

  try {
    // Check if resume file exists
    //await fs.access(path.join(__dirname, `/resumes/${req.body.position}.pdf`));

    // Send email
    await transport.sendMail(emailContent);

    console.log("Email sent successfully");
    return res.status(200).json({
      status: 'success',
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error("Error:", error);

    // Handle specific error types
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        status: 'error',
        message: 'Resume file not found',
        error: `No resume found for position: ${req.body.position}`
      });
    }

    if (error.code === 'EAUTH') {
      return res.status(401).json({
        status: 'error',
        message: 'Email authentication failed',
        error: error.message
      });
    }

    // Generic error handler
    return res.status(500).json({
      status: 'error',
      message: 'Failed to send email',
      error: error.message
    });
  }
});