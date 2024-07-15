const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

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
    });

    await userData.save();
    res.json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ errorMessage: "Something went wrong." });
  }
};


// login controller

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

    // Generate JWT token
    const token = jwt.sign({ userId: userDetails._id, email: userDetails.email }, process.env.JWT_SECRET, { expiresIn: '1 h' });

    // Send token in the response
    res.json({ token, message: "User logged in successfully" });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ errorMessage: "Something went wrong" });
  }
};


module.exports = { registerUser, loginUser };
