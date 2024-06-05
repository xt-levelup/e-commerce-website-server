// -----------------------------------------------------------------
// --- MODEL CHO CÁC ORDER TỪ USER ---------------------------------
// -----------------------------------------------------------------

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  order: { type: Object, required: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  orderDate: { type: Date, required: true },
});

module.exports = mongoose.model("Orders", orderSchema);

// ------------------------------------------------------------------
