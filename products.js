const mongoose = require("mongoose");
// Product Schema
const productSchema = new mongoose.Schema({
    title: String,
    slug: String,
    creator: String,
    owner: String,
    description: String,
    price: Number,
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category'}],
    picture: String,
    // deleted: Boolean,
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
        slug: this.slug, 
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