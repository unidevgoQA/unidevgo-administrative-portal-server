import { ObjectId } from "mongodb";

// Get all attendance records
export const getAllAttendanceRecords = async (req, res) => {
  const attendanceCollection = req.app.locals.db.collection(
    "attendence-management"
  );
  const cursor = attendanceCollection.find({});
  const attendanceList = await cursor.toArray();

  res.send({ status: true, data: attendanceList });
};


// Get an attendance record by ID
export const getAttendanceById = async (req, res) => {
  const { id } = req.params;
  const attendanceCollection = req.app.locals.db.collection(
    "attendence-management"
  );
  const attendance = await attendanceCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!attendance) {
    return res
      .status(404)
      .send({ status: false, message: "Attendance record not found" });
  }

  res.send({ status: true, data: attendance });
};

// Add a new attendance record
export const addAttendance = async (req, res) => {
  const singleAttendence = req.body;
  const requestedDate = new Date(singleAttendence.date);
  const attendanceCollection = req.app.locals.db.collection(
    "attendence-management"
  );
  try {
    const existingEntry = await attendanceCollection.findOne({
      date: requestedDate,
    });

    if (existingEntry) {
      return res.json({
        status: false,
        message: "Attendance record already exists for the specified date.",
      });
    } else {
      const result = await attendanceCollection.insertOne(singleAttendence);
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
};

// Delete an attendance record by ID
export const deleteAttendanceById = async (req, res) => {
  const { id } = req.params;
  const attendanceCollection = req.app.locals.db.collection(
    "attendence-management"
  );
  const query = { _id: new ObjectId(id) };
  const result = await attendanceCollection.deleteOne(query);
  res.send({ status: true, data: result });
};

// controllers/attendanceController.js
export const getAttendanceByEmail = async (req, res) => {
  const email = req.params.email;

  // Connect to the MongoDB collection
  const attendanceCollection = req.app.locals.db.collection(
    "attendence-management"
  );
  // Check if the email parameter is valid
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ status: false, message: 'Invalid email parameter' });
  }

  try {
    // Find all attendance records that match the employeeEmail
    const result = await attendanceCollection.find({ employeeEmail: email }).toArray();

    // Check if any records were found
    if (result.length > 0) {
      return res.json({ status: true, data: result });
    } else {
      return res.json({ status: false, message: 'No records found for this email' });
    }
  } catch (error) {
    console.error('Error fetching attendance by email:', error);
    return res.status(500).json({ status: false, message: 'Internal server error' });
  }
};
