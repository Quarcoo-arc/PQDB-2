const express = require("express");
const mongoose = require("mongoose");
const body_parser = require("body-parser");
const bcrypt = require("bcryptjs");

const exp = express();
const bodyParser = body_parser;

exp.use(bodyParser.json());
exp.use(express.static("front"));
exp.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect("mongodb://localhost:27017/usersdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
const Schema = mongoose.Schema;

db.on("error", () => console.log("Database connection error"));
db.once("open", () => console.log("Database connected"));
db.on("close", () => console.log("Database disconnected"));

const userSchema = new Schema(
  {
    ref_no: { type: Number, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "student" }
);

const User = mongoose.model("User", userSchema);

exp.post("/signup", async (req, res) => {
  const {
    ref_no,
    first_name,
    last_name,
    email,
    username,
    password: plainPassword,
    password2,
  } = req.body;

  if (
    !ref_no ||
    !first_name ||
    !email ||
    !username ||
    !plainPassword ||
    !password2
  ) {
    return res.json("Please fill in all the fields");
  }

  if (plainPassword !== password2) {
    return res.json("Password does not match Confirmation Password");
  }

  if (plainPassword.length < 8) {
    return res.json("Password too short. Should be at least 8 characters");
  }

  const password = await bcrypt.hash(plainPassword, 10);

  try {
    const response = await User.create({
      ref_no,
      first_name,
      last_name,
      email,
      username,
      password,
    });
    console.log("User created successfuly: ", response);
    return res.redirect("user-dashboard.html");
  } catch (error) {
    if (error.code === 11000) {
      return res.json("Username already registered");
    }
    throw error;
  }
});

exp
  .get("/login", (req, res) => res.redirect("login.html"))
  .post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.json("Invalid username!");
    }

    if (await bcrypt.compare(password, user.password)) {
      return res.redirect("dashboard.html");
    } else {
      return res.json("Password is incorrect!");
    }
  })
  .get("/admin-login", (req, res) => {
    //insert one document into the admin collection
    // db.collection("admin").insertOne(
    //   { _id: 1, user_name: "admin", password: "1234" },
    //   (err, collection) => {
    //     if (err) {
    //       throw err;
    //     }
    //     console.log("Admin record successfully added!");
    //   }
    // );
    //Username = admin , Password  = 1234

    return res.redirect("admin-login.html");
  })
  .post("/admin-login", async (req, res) => {
    const user_name = req.body.user_name;
    const password = req.body.password;
    try {
      const admin = await db
        .collection("admin")
        .findOne({ user_name: user_name, password: password });

      if (admin === null) {
        return res.send("Invalid username or incorrect password!");
      }

      if (user_name === admin.user_name && password === admin.password) {
        return res.redirect("admin-dashboard.html");
      } else {
        return res.send("Invalid username or incorrect password!");
      }
    } catch (error) {
      console.log("Error validating admin!");
    }
  });

exp.post("/logout", async (req, res) => {
  const logout = req.body;
  if (logout) {
    return res.redirect("login.html");
  }
});

exp
  .get("/", (req, res) => {
    res.set({ "Allow-access-Allow-Origin": "*" });
    return res.redirect("signup.html");
  })
  .listen(3000);

console.log("Listening from port 3000");
