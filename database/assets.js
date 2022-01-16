const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
    id: String,     // The id of the asset
    user: String,   // The user who created the asset
    name: String,   // name of the asset
    file: String,   // URL
    deleted: {
        type: Boolean,
        default: false,
      }

})

const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;