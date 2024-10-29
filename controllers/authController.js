import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register a new profile
export const registerProfile = async (req, res) => {
  const {
    name,
    designation,
    gender,
    img,
    joiningDate,
    mobile,
    address,
    email,
    password,
    role,
    profileEditPermission,
    appointmentPermission,
  } = req.body;

  console.log("Body",req.body);

  try {
    const profileCollection = req.app.locals.db.collection(
      "profiles-management"
    );

    const user = await profileCollection.findOne({ email });

    console.log("user", user);

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      designation,
      gender,
      img,
      joiningDate,
      mobile,
      address,
      email,
      password: hashedPassword,
      role,
      profileEditPermission,
      appointmentPermission,
    };

    const result = await profileCollection.insertOne(newUser);
    console.log(result);
    const payload = { userId: newUser._id };
    const token = jwt.sign(payload, process.env.JWT_KEY, {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


// Login profile
export const loginProfile = async (req, res) => {
  const { email, password } = req.body;

  try {
    const profileCollection = req.app.locals.db.collection(
      "profiles-management"
    );
    const user = await profileCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "1h" });

    // Send user information along with the token
    res.json({
      token,
      profile: {
        id : user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        desgination: user.desgination,
        gender: user.gender,
        img: user.img,
        joiningDate: user.joiningDate,
        mobile: user.mobile,
        address: user.address,
        profileEditPermission: user.profileEditPermission,
        appointmentPermission: user.appointmentPermission,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


// Update Password
export const updatePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  console.log(email,oldPassword,newPassword)

  try {
    const profileCollection = req.app.locals.db.collection("profiles-management");
    const user = await profileCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await profileCollection.updateOne(
      { email },
      { $set: { password: hashedNewPassword } }
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};