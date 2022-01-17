const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    profilePicture: String,   // Can be null
    id: String,
    deleted: {
      type: Boolean,
      default: false,
    }
  })

userSchema.pre("save", function(next) {
  this._id = this.id;
  next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;