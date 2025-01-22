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
  const selfPrompt = `I am a Passionate software developer with a strong foundation in Java. I’ve crafted various successful projects, showcasing my proficiency in
React, MongoDB, Node.js, and Express js. My expertise extends to developing robust applications using MERN stack and crafting dynamic user
interfaces. My ability to work across the full‑stack spectrum, coupled with a keen interest in learning new technologies, makes me a valuable asset
to your team. Use these details for your responses:

Personal:
- Phone: +917907144673
- Email: kumarjayaram545@gmail.com
- LinkedIn: jayaram-s-kumar-48607920b

Education:
- B.Tech in Computer Science from College of Engineering and Management Punnapra (2020-2024), CGPA: 7.0
- Higher Secondary from GBHSS Kayamkulam (2018-2020), 90%

Experience:
- Java Full Stack Development at Qspiders Kochi (August 2024-Present)
  - Focus on OOP concepts and Collections framework
- React Developer Intern at Igoraza Pvt Ltd (March 2023-August 2023)
  - Built UI interfaces and a real estate/automobile platform
  - Experienced with Git and team collaboration
- User Engagement Intern at Speakapp Pvt. Ltd. (January 2022-March 2022)
  - Drove user growth through content creation

Projects:
1. Wheels & Walls: Real estate/automobile platform with user profiles, OTP verification, and file uploads
2. Just4Marry: Matrimonial website with profile management and friend request system
3. Lung Cancer Detection System: Web app using CNN for cancer classification
4. E-commerce Platform: Full-featured with user profiles and admin panel

Technical Skills:
- Programming: Java, JavaScript (ReactJS), HTML/CSS
- Frameworks: ExpressJS, Bootstrap, Material UI, Tailwind CSS
- Databases: MongoDB, SQL, PostgreSQL
- Tools: Eclipse, VScode, Git(GitHub), Postman

Leadership:
- Campus Outreach Lead at Tinkerhub (Jan 2021-Jan 2023)
- Organized tech events and led student engagement initiatives

Key Strengths:
- Full-stack development expertise
- Strong foundation in Java
- Experience with MERN stack
- Team collaboration
- Leadership and communication skills`


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
       Generate an original, professional job application email based on the provided information.
       The response must be parseable by JSON.parse() and follow this exact structure:
       {"hrEmail":"email@example.com","subject":"Job Application Subject","emailBody":"Email content here"}
       Ensure all special characters and line breaks in emailBody are properly escaped.
       The email body should be a html data.So use html tags wisely to make the mail look neater and prodessional.
       Don't make the email too long.Make it simple and short.
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
  // const user = "lensikoviski@gmail.com";
  // const password = "qnhd oopy fdsy elez";
  const user = "kumarjayaram545@gmail.com"
  const password = "nmop tcvs kalx tvjc"

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
    to: myEmailObj.hrEmail,
    // to: "kumarjayaram545@gmail.com",
    subject: myEmailObj.subject,
    html: myEmailObj.emailBody,
    attachments: [{
      filename: `JAYARAM_S_KUMAR.pdf`,
      path: path.join(__dirname, `/resumes/JAYARAM_S_KUMAR_RESUME.pdf`)
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