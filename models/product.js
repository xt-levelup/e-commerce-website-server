// -----------------------------------------------------------------
// --- MODEL TẠO CHO SẢN PHẨM --------------------------------------
// -----------------------------------------------------------------

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  short_desc: {
    type: String,
    required: true,
  },
  long_desc: {
    type: String,
    required: true,
  },
  imageUrls: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  initQuantity: {
    type: Number,
    required: true,
  },
  inventoryQuantity: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Products", productSchema);

// ---------------------------------------------------------------
