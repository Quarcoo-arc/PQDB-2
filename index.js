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

db.on("error", () => console.log("Database connection error"));
db.once("open", () => console.log("Database connected"));
db.once("closed", () => console.log("Database disconnected"));

exp.post("/signup", (req, res) => {
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const ref_no = req.body.ref_no;
  const e_mail = req.body.e_mail;
  const user_name = req.body.user_name;
  const password = req.body.password;
  const password_confirmation = req.body.password2;

  if (password_confirmation !== password) {
    console.log("Password does not match Confirmation Password");
    return res.send("Passwords do not match!");
  }

  const user_data = {
    _id: ref_no,
    first_name: first_name,
    last_name: last_name,
    "e-mail": e - mail,
    user_name: user_name,
    password: password,
  };

  db.collection("student").insertOne(user_data, (err, collection) => {
    if (err) {
      throw err;
    }
    console.log("Record inserted successfully");
  });

  return res.redirect("user-dashboard.html");
});

exp
  .get("/login", (req, res) => res.redirect("login.html"))
  .post("/login", async (req, res) => {
    const user_name = req.body.user_name;
    const password = req.body.password;
    const user = await db
      .collection("student")
      .findOne({ user_name: user_name, password: password });

    const users = await db.collection("student").find({}).toArray();

    // console.log(user);
    // console.log("Username: ", user.user_name);
    // console.log(users);

    return user === null
      ? res.send("Invalid username or incorrect password!")
      : res.redirect("user-dashboard.html");
  })
  .get("/admin-login", (req, res) => {
    //insert one document into the admin collection
    //TODO: remove the insertion into the admin collection once its done
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

exp
  .get("/", (req, res) => {
    res.set({ "Allow-access-Allow-Origin": "*" });
    return res.redirect("signup.html");
  })
  .listen(3000);

console.log("Listening from port 3000");
