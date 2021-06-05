const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: String,
});

exports.Product = mongoose.model("Product", productSchema);
