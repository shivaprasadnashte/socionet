import generatetoken from "../config/generateToken.js";
import User from "../models/user.model.js";
import bcrytpjs from "bcryptjs";

export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).send("please fill your all detsils");
    }
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).send("No user with provided credentials found");
    }

    const isMatch = await bcrytpjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).send("Password in incorrect");
    }

    res.status(200).json({
      token: generatetoken(user._id),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
}

export async function register(req, res) {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).send("Please fill all your details");
    }

    const useremail = await User.find({
      email: email,
    });

    if (useremail.length != 0) {
      return res.status(400).send("Email already exists");
    }

    const user = await User.find({
      username: username,
    });
    if (user.length != 0) {
      return res.status(400).send("Username already exists");
    }

    const salt = await bcrytpjs.genSalt(10);
    const hashedpassword = await bcrytpjs.hash(password, salt);

    const newuser = new User({
      email: email,
      username: username,
      password: hashedpassword,
    });

    await newuser.save();

    return res.status(200).json({
      token: generatetoken(newuser._id),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
}

export async function getUserDetails(req, res) {
  try {
    return res.status(200).json({
      _id: req.user._id,
      username: req.user.username,
      useremail: req.user.email,
    });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}
