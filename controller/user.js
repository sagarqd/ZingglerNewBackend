const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const sendVerifymail = async (firstName, lastName, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 587,
      auth: {
          user: 'noreply@infutech.in',
          pass: 'Test1234@*#'
      }
  });

    const mailOptions = {
      from: "noreply@infutech.in",
      to: email,
      subject: "Verify your email address",
      text: `Hello ${firstName} ${lastName},\n\nPlease verify your email by clicking on the link below:\n\nhttp://localhost:3000/api/auth/verify/${user_id}\n\nThank you!`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (err) {
    console.error("Error sending verification email:", err);
    throw new Error("Failed to send verification email.");
  }
};

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        errorMessage: "Invalid credentials.",
      });
    }

    const isExistingUser = await User.findOne({ email: email });
    if (isExistingUser) {
      return res.status(400).json({
        errorMessage: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      is_verified: false
    });

    await userData.save();

    await sendVerifymail(firstName, lastName, email, userData._id);

    res.json({ message: "User registered successfully. Verification email sent." });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ errorMessage: "Something went wrong." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ errorMessage: "Invalid credentials" });
    }

    const userDetails = await User.findOne({ email: email });
    if (!userDetails) {
      return res.status(404).json({ errorMessage: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, userDetails.password);
    if (!passwordMatch) {
      return res.status(400).json({ errorMessage: "Invalid credentials" });
    }

    if (!userDetails.is_verified) {
      return res.status(400).json({ errorMessage: "Please verify your email first." });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: userDetails._id, email: userDetails.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send token in the response
    res.json({ token, message: "User logged in successfully" });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ errorMessage: "Something went wrong" });
  }
};

const verifyMail = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ errorMessage: "User not found" });
    }

    user.is_verified = true;
    await user.save();

    res.json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Error in verifyMail:", error);
    res.status(500).json({ errorMessage: "Something went wrong" });
  }
};

module.exports = { registerUser, loginUser, verifyMail };
