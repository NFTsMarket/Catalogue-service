const mongoose = require("mongoose");

// Product Schema
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    owner: String,
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    categories: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    createdAt: Date,
    updatedAt: Date
});

// This method returns the attributes we want to obtain in the 
// get operation (i.e., the attributes we want to show to the user)
// For example, in this example we are supressing the "deleted" attribute
productSchema.methods.cleanup = function() {
    return { 
        id: this._id,
        title: this.title, 
        creator: this.creator, 
        owner: this.owner, 
        description: this.description,
        price: this.price,
        categories: this.categories,
        picture: this.picture,
        createdAt: this.createdAt.toLocaleDateString("en-US"),
        updatedAt: this.updatedAt.toLocaleDateString("en-US")
    };
}

// Product class (This class is a model of productSchema)
const Product = mongoose.model('Product', productSchema);

module.exports = Product;