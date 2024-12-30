const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userModel = require("./Models/LoginDB");

dotenv.config();

const app = express();
app.use(cors({ origin: "https://bis-client.vercel.app" }));
// app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.post("/auth", (req, res) => {
  const { email, password } = req.body;

  userModel
    .findOne({ Email: email })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", isAuth: false });
      }

      if (password !== user.Password) {
        return res
          .status(401)
          .json({ message: "Password is not valid", isAuth: false });
      }
      res.json({
        message: "User validated successfully",
        isAuth: true,
        name: user.Username,
      });
      user.Score = 0;
    })
    .catch((err) =>
      res.status(500).json({ message: "Server error", error: err })
    );
});

app.post("/add", (req, res) => {
  const user = req.body.User;
  console.log(user);

  userModel
    .findOne({ Email: user.email })
    .then((existingUser) => {
      if (existingUser) {
        res.status(400).json({ error: "Email is already registered" });
      } else {
        userModel
          .create({
            Email: user.email,
            Username: user.username,
            Password: user.password,
            Score: 0,
          })
          .then((result) => res.json(result))
          .catch((err) => res.status(500).json(err));
      }
    })
    .catch((err) => res.status(500).json(err));
});

app.put("/updateScore", (req, res) => {
  const { username, score } = req.body;

  userModel
    .findOne({ Username: username })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (score > user.Score) {
        return userModel
          .findOneAndUpdate(
            { Username: username },
            { Score: score },
            { new: true }
          )
          .then((updatedUser) => {
            res.json({
              success: true,
              message: "Score updated successfully",
              user: updatedUser,
            });
          });
      } else {
        res.json({
          success: true,
          message: "Score not updated. New score is not higher.",
        });
      }
    })
    .catch((err) => {
      console.error("Error updating score:", err);
      res
        .status(500)
        .json({ success: false, message: "Error updating score", error: err });
    });
});

app.get("/leaderboard", (req, res) => {
  userModel
    .find({}, "Username Score")
    .sort({ Score: -1 })
    .limit(6)
    .then((users) => {
      res.json({ success: true, data: users });
    })
    .catch((err) => {
      console.error("Error fetching leaderboard data:", err);
      res.status(500).json({
        success: false,
        message: "Error fetching leaderboard",
        error: err,
      });
    });
});

app.listen(PORT, () => {
  console.log("Server is Running");
});
