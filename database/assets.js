const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
    id: String, 
    filename: String,
    baseUrl: String,
    deleted: {
        type: Boolean,
        default: false,
      }

})

const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;