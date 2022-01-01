const mongoose = require("mongoose");
// Product Schema
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: [0, "Price cannot be negative, inserted: {VALUE}"],
    required: true,
  },
  categories: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/.test(
          v
        );
      },
      msg: "Please, insert a valid url in the property {PATH}, inserted: '{VALUE}'",
    },
  },
  createdAt: String,
  updatedAt: String,
});

// This method returns the attributes we want to obtain in the
// get operation (i.e., the attributes we want to show to the user)
// For example, in this example we are supressing the "deleted" attribute
productSchema.methods.cleanup = function () {
  return {
    id: this._id,
    title: this.title,
    creator: this.creator,
    owner: this.owner,
    description: this.description,
    price: this.price,
    categories: this.categories,
    picture: this.picture,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Product class (This class is a model of productSchema)
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
