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

// This method returns the attributes we want to obtain in the 
// get operation (i.e., the attributes we want to show to the user)
// For example, in this example we are supressing the "deleted" attribute
productSchema.methods.cleanup = function() {
    return { 
        title: this.title, 
        slug: this.slug, 
        creator: this.creator, 
        owner: this.owner, 
        description: this.description,
        price: this.price,
        categories: this.categories,
        picture: this.picture,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
}

// Product class (This class is a model of productSchema)
const Product = mongoose.model('Product', productSchema);

module.exports = Product;