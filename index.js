const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const app = express();
require("dotenv").config();

const cors = require("cors");
const port = process.env.PORT || 5000;
// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clusterunidevgo.2nk4dzo.mongodb.net/?retryWrites=true`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await client.connect();
    console.log("db connected");
    const database = client.db("unidevgo-administrative-portal");
    const profileCollection = database.collection("profile");
    const workStatusCollection = database.collection("work-status");
    const leaveManagementCollection = database.collection("leave-management");
    const leaveEmailListCollection = database.collection(
      "leave-email-list-management"
    );
    const eventManagementCollection = database.collection("event-management");
    const supportTicketsCollection = database.collection(
      "support-tickets-managements"
    );
    const attendenceManagementCollection = database.collection(
      "attendence-management"
    );

    //Get All Profile
    app.get("/profile", async (req, res) => {
      const cursor = profileCollection.find({});
      const profiles = await cursor.toArray();
      res.send({ status: true, data: profiles });
    });
    //Get All work status
    app.get("/work-status", async (req, res) => {
      const cursor = workStatusCollection.find({});
      const workStatus = await cursor.toArray();
      res.send({ status: true, data: workStatus });
    });
    //Get All work status
    app.get("/calender-events", async (req, res) => {
      const cursor = eventManagementCollection.find({});
      const AllEvents = await cursor.toArray();
      res.send({ status: true, data: AllEvents });
    });
    //Get All attendence
    app.get("/attendence", async (req, res) => {
      const cursor = attendenceManagementCollection.find({});
      const AllAttendence = await cursor.toArray();
      res.send({ status: true, data: AllAttendence });
    });
    //Get All work status
    app.get("/leave-management", async (req, res) => {
      const cursor = leaveManagementCollection.find({});
      const allLeaves = await cursor.toArray();
      res.send({ status: true, data: allLeaves });
    });
    //Get All work status
    app.get("/support-tickets", async (req, res) => {
      const cursor = supportTicketsCollection.find({});
      const allTickets = await cursor.toArray();
      res.send({ status: true, data: allTickets });
    });
    //Get All Email List
    app.get("/email-list", async (req, res) => {
      const cursor = leaveEmailListCollection.find({});
      const allEmailList = await cursor.toArray();
      res.send({ status: true, data: allEmailList });
    });
    //Get single profile
    app.get("/profile/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await profileCollection.findOne(query);
      res.send({ status: true, data: result });
    });
    //Get single profile
    app.get("/support-tickets/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await supportTicketsCollection.findOne(query);
      res.send({ status: true, data: result });
    });
    //Get single work status
    app.get("/work-status/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await workStatusCollection.findOne(query);
      res.send({ status: true, data: result });
    });
    //Add Profile
    app.post("/profile", async (req, res) => {
      const profile = req.body;
      const result = await profileCollection.insertOne(profile);
      res.send({ status: true, data: result });
    });
    //Add Email
    app.post("/email-list", async (req, res) => {
      const email = req.body;
      const result = await leaveEmailListCollection.insertOne(email);
      res.send({ status: true, data: result });
    });
    //Add work status
    app.post("/work-status", async (req, res) => {
      const singleWorkStatus = req.body;
      const result = await workStatusCollection.insertOne(singleWorkStatus);
      res.send({ status: true, data: result });
    });

    //Add Event
    app.post("/calender-events", async (req, res) => {
      const singleEvent = req.body;
      const result = await eventManagementCollection.insertOne(singleEvent);
      res.send({ status: true, data: result });
    });

    //Create Ticket
    app.post("/support-tickets", async (req, res) => {
      const ticket = req.body;
      const singleTicket = {
        ...ticket,
        replies: [],
      };
      const result = await supportTicketsCollection.insertOne(singleTicket);
      res.send({ status: true, data: result });
    });

    //Ticket Reply
    app.post("/support-tickets/reply/:id", async (req, res) => {
      const {
        parentId,
        reply,
        date,
        time,
        employeeEmail,
        employeeImg,
        employeeName,
      } = req.body;
      const result = await supportTicketsCollection.updateOne(
        { _id: new ObjectId(parentId) },
        {
          $push: {
            replies: {
              reply,
              date,
              time,
              employeeEmail,
              employeeImg,
              employeeName,
            },
          },
        }
      );
      res.send({ status: true, data: result });
    });

    //Add Attendence
    app.post("/attendence", async (req, res) => {
      const singleAttendence = req.body;
      const requestedDate = new Date(singleAttendence.date);
      try {
        const existingEntry = await attendenceManagementCollection.findOne({
          date: requestedDate,
        });

        if (existingEntry) {
          return res.json({
            status: false,
            message: "Attendance record already exists for the specified date.",
          });
        } else {
          const result = await attendenceManagementCollection.insertOne(
            singleAttendence
          );
          return res.json({
            status: true,
            message: "Attendance record added successfully.",
            data: result,
          });
        }
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ status: false, error: "Internal Server Error" });
      }
    });
    //Send Mail
    app.post("/send-email", upload.array("attachments"), (req, res) => {
      const { recipients, subject, message } = req.body;
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

      res
        .status(200)
        .send({ status: true, message: "Emails sent successfully" });
    });

    //Add leave management
    app.post("/leave-management", async (req, res) => {
      const leaveApply = req.body;
      const result = await leaveManagementCollection.insertOne(leaveApply);
      res.send({ status: true, data: result });
    });
    //Get profile by email
    app.get("/register-user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await profileCollection.findOne({ email });
      if (result?.email) {
        return res.send({ status: true, data: result });
      }
      res.send({ status: false });
    });
    //Delete single item from work status Api
    app.delete("/work-status/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await workStatusCollection.deleteOne(query);
      res.json({ status: true, data: result });
    });
    //Delete single item from calender-events Api
    app.delete("/calender-events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventManagementCollection.deleteOne(query);
      res.json({ status: true, data: result });
    });
    //Delete single item from leave-management Api
    app.delete("/leave-management/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await leaveManagementCollection.deleteOne(query);
      res.json({ status: true, data: result });
    });
    //Delete single item from leave-management Api
    app.delete("/attendence/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await attendenceManagementCollection.deleteOne(query);
      res.json({ status: true, data: result });
    });
    //Delete single item from profile Api
    app.delete("/profile/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await profileCollection.deleteOne(query);
      res.json({ status: true, data: result });
    });
    //Delete single item from email list Api
    app.delete("/email-list/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await leaveEmailListCollection.deleteOne(query);
      res.json({ status: true, data: result });
    });
    //Delete single item from support ticket
    app.delete("/support-tickets/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await supportTicketsCollection.deleteOne(query);
      res.json({ status: true, data: result });
    });

    //Update profile
    app.put("/profile/:id", async (req, res) => {
      const id = req.params.id;
      const profile = req.body.updateProfile;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateProfile = {
        $set: {
          ...profile,
        },
      };
      // Remove _id from the update, as it is immutable
      delete updateProfile.$set._id;

      const result = await profileCollection.updateOne(
        filter,
        updateProfile,
        options
      );
      res.send({ status: true, data: result });
    });

    //Update Work Status
    app.put("/work-status/:id", async (req, res) => {
      const id = req.params.id;
      const updatedWorkStatus = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTask = {
        $set: {
          task: updatedWorkStatus.task,
          date: updatedWorkStatus.date,
          hour: updatedWorkStatus.hour,
          workStatus: updatedWorkStatus.workStatus,
          description: updatedWorkStatus.description,
        },
      };
      const result = await workStatusCollection.updateOne(
        filter,
        updateTask,
        options
      );
      res.send({ status: true, data: result });
    });

    //Update support ticket status
    app.put("/support-tickets/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTicket = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTicket = {
        $set: {
          status: updatedTicket?.status,
        },
      };
      const result = await supportTicketsCollection.updateOne(
        filter,
        updateTicket,
        options
      );
      res.send({ status: true, data: result });
    });

    //Update Profile Edit Permission
    app.put("/profile-edit/:id", async (req, res) => {
      const id = req.params.id;
      const updatedPermission = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProfileEditPermission = {
        $set: {
          profileEditPermission: updatedPermission?.profileEditPermission,
        },
      };
      const result = await profileCollection.updateOne(
        filter,
        updateProfileEditPermission,
        options
      );
      res.send({ status: true, data: result });
    });

    //Update Appointment Permission
    app.put("/appointment-permission/:id", async (req, res) => {
      const id = req.params.id;
      const updatedPermission = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateAppointmentPermission = {
        $set: {
          appointmentPermission: updatedPermission?.appointmentPermission,
        },
      };
      const result = await profileCollection.updateOne(
        filter,
        updateAppointmentPermission,
        options
      );
      res.send({ status: true, data: result });
    });

    //Update leave Status
    app.put("/leave-management/:id", async (req, res) => {
      const id = req.params.id;
      const updatedLeaveStatus = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateLeave = {
        $set: {
          status: updatedLeaveStatus?.leave?.leaveStatus,
        },
      };
      const result = await leaveManagementCollection.updateOne(
        filter,
        updateLeave,
        options
      );
      res.send({ status: true, data: result });
    });

    //Send leave email
    app.post("/leave-email", (req, res) => {
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
    });

    //Send appointment confirmation email
    app.post("/appointment-confirmation-email", (req, res) => {
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

      console.log(concatenatedEmails);

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
    });

    //Send appointment confirmation email
    app.post("/event-email", (req, res) => {
      const {
        //Appoitment data
        eventTitle,
        employeesEmail,
      } = req.body;

      console.log(req.body);

      const recievers = [...employeesEmail];
      const concatenatedEmails = recievers.join(",");
      console.log(concatenatedEmails);

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

        subject: `Wishing You a Wonderful ${eventTitle}!`,
        html: `
        <div style="padding: 15px;">
        <p>Wishing you a fantastic ${eventTitle}! May it bring joy, unity, and memorable moments.</p>

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
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("UnidevGO Server Running");
});

app.listen(port, () => {
  console.log("UnidevGO Server Running", port);
});
