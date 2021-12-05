const mongoose = require("mongoose");

// Product Schema
const productSchema = new mongoose.Schema({
    title: String,
    slug: String,
    creator: String,
    owner: String,
    description: String,
    price: Number,
    categories: String,
    picture: String,
    deleted: Boolean,
    createdAt: Date,
    updatedAt: Date
});

// Product class (This class is a model of productSchema)
const Product = mongoose.model('Product', productSchema);

module.exports = Product;