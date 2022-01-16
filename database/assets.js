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

assetSchema.pre("save", function(next) {
  this._id = this.id;
  next();
})

const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;