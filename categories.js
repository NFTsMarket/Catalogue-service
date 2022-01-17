const mongoose = require("mongoose");

// Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  createdAt: String,
  updatedAt: String,
});

// This method returns the attributes we want to obtain in the
// get operation (i.e., the attributes we want to show to the user)
// For example, in this example we are supressing the "deleted" attribute
categorySchema.methods.cleanup = function () {
  return {
    id: this._id,
    name: this.name,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    // deleted: this.deleted,
  };
};

// Category class (This class is a model of categorySchema)
const Category = mongoose.model("category", categorySchema);

module.exports = Category;
