import { ObjectId } from "mongodb";

//Get all profile
export const getAllProfiles = async (req, res) => {
  const profileCollection = req.app.locals.db.collection("profiles-management");
  const cursor = profileCollection.find({});
  const profiles = await cursor.toArray();
  res.send({ status: true, data: profiles });
};

//Get profile by email
export const getProfileByEmail = async (req, res) => {
  const email = req.params.email;
  const profileCollection = req.app.locals.db.collection("profiles-management");
  const result = await profileCollection.findOne({ email });
  if (result?.email) {
    return res.send({ status: true, data: result });
  }
  res.send({ status: false });
};

//Get profile by Id
export const getProfileById = async (req, res) => {
  const { id } = req.params;
  const profileCollection = req.app.locals.db.collection("profiles-management");
  const profile = await profileCollection.findOne({ _id: new ObjectId(id) });
  if (profile) {
    res.send({ status: true, data: profile });
  } else {
    res.status(404).send({ status: false, message: "Profile not found" });
  }
};

//Create Profile
export const createProfile = async (req, res) => {
  const profileCollection = req.app.locals.db.collection("profiles-management");
  const newProfile = req.body;
  const result = await profileCollection.insertOne(newProfile);
  res.send({ status: true, data: result.ops[0] });
};

//Update Profile
export const updateProfile = async (req, res) => {
  const { id } = req.params;
  const profileCollection = req.app.locals.db.collection("profiles-management");
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
};

//Delete Profile
export const deleteProfile = async (req, res) => {
  const { id } = req.params;
  const profileCollection = req.app.locals.db.collection("profiles-management");
  const result = await profileCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount > 0) {
    res.send({ status: true, message: "Profile deleted successfully" });
  } else {
    res.status(404).send({ status: false, message: "Profile not found" });
  }
};

//Update Profile Edit Permission (Super Admin)
export const profileEditPermission = async (req, res) => {
  const id = req.params.id;
  const updatedPermission = req.body;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateProfileEditPermission = {
    $set: {
      profileEditPermission: updatedPermission?.profileEditPermission,
    },
  };
  const profileCollection = req.app.locals.db.collection("profiles-management");
  const result = await profileCollection.updateOne(
    filter,
    updateProfileEditPermission,
    options
  );
  res.send({ status: true, data: result });
};

//Update Appointment Permission (Super Admin)
export const appointmentPermission = async (req, res) => {
  const id = req.params.id;
  const updatedPermission = req.body;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateAppointmentPermission = {
    $set: {
      appointmentPermission: updatedPermission?.appointmentPermission,
    },
  };
  const profileCollection = req.app.locals.db.collection("profiles-management");
  const result = await profileCollection.updateOne(
    filter,
    updateAppointmentPermission,
    options
  );
  res.send({ status: true, data: result });
};
