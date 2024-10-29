import multer from "multer";
import nodemailer from "nodemailer";

const storage = multer.memoryStorage();
const upload = multer({ dest: "uploads/" });

//Send Email
export const sendEmail = (req, res) => {
  const { recipients, subject, message } = req.body;
  console.log(req.body);
  const recipientList = recipients.split(",");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
    },
  });

  // Iterate over each recipient and send email individually
  recipientList.forEach((recipient) => {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: recipient.trim(),
      subject: subject,
      text: message,
      attachments: [],
    };

    if (req.files) {
      req.files.forEach((file) => {
        mailOptions.attachments.push({
          filename: file.originalname,
          path: file.path,
        });
      });
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email to", recipient, ":", error);
      } else {
        console.log("Email sent successfully to", recipient);
      }
    });
  });

  res.status(200).send({ status: true, message: "Emails sent successfully" });
};

//Attachments
export const uploadAttachments = upload.array("attachments");

//Send leave email
export const sendLeaveEmail = (req, res) => {
  const { leaveStatus, recipients, employeeName, totalDays, leaveApply } =
    req.body;

  const concatenatedEmails = recipients.join(",");

  //Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
    },
  });

  // Setup email data
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: concatenatedEmails.split(","),
    subject: `${
      leaveStatus.charAt(0).toUpperCase() + leaveStatus.slice(1)
    } Leave Application of ${
      employeeName.charAt(0).toUpperCase() + employeeName.slice(1)
    }`,
    text: `
    
    Hi ${employeeName.charAt(0).toUpperCase() + employeeName.slice(1)},

    You have requested to take leave on ${leaveApply} for ${totalDays} day/s. Please see
    the details for future reference:

  • Requested By: ${
    employeeName.charAt(0).toUpperCase() + employeeName.slice(1)
  }
  • Requested On: ${leaveApply}
  • Requested Days of Leave: ${totalDays}
  • Response From HR: ${
    leaveStatus.charAt(0).toUpperCase() + leaveStatus.slice(1)
  }

    This leave request was ${
      leaveStatus.charAt(0).toUpperCase() + leaveStatus.slice(1)
    }

    Regards,

    HR Department
    unidevGO
    Email: hr@unidevgo.com
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send("Email sent: " + info.response);
  });
};

//Send appointment confirmation email
export const appointmentConfirmationEmail = (req, res) => {
  const {
    //Appoitment data
    name,
    mobile,
    email,
    recipients,
    date,
    time,
    selectMemberName,
    selectMemberDesignation,
    meetingUrl,
    message,
  } = req.body;

  const recievers = [email, ...recipients];

  const concatenatedEmails = recievers.join(",");

  //Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
    },
  });

  // Setup email data
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: concatenatedEmails.split(","),

    subject: `Appointment Confirmation `,
    html: `
    <div style="padding: 15px;">
    <p>Dear ${name.charAt(0).toUpperCase() + name.slice(1)},</p>

    <p>Thank you for choosing unidevGO for your upcoming appointment. We are delighted to confirm the details of your scheduled meeting. Please find the information below:</p>


    <p>Name: ${name.charAt(0).toUpperCase() + name.slice(1)}</p>
    <p>Mobile: ${mobile}</p>
    <p>Email: ${email}</p>
    <p>Date & Time: ${date} - ${time} BST</p>
    <p>Meeting with: ${selectMemberName} - ${selectMemberDesignation}</p>
    <p>Meeting Link: ${meetingUrl}</p>
    <p>Message: ${message}</p>


    <p>Our team at unidevGO is looking forward to assisting you during your appointment. If there are any changes or if you have further questions, please feel free to reach out to us at hr@unidevgo.com.</p>

    <p>Thank you for choosing unidevGO. We appreciate your trust in our services.</p>

    <p>Best regards,<br>unidevGO</p>
    </div>
   
`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send("Email sent: " + info.response);
  });
};
