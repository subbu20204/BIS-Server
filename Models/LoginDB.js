const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  Email: String,
  Username: String,
  Password: String,
  Score: Number,
});

const userModel = mongoose.model("users", UserSchema);
module.exports = userModel;
