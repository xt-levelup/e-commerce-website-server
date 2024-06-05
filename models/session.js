// -----------------------------------------------------------------
//--- Có thể sử dụng session này để thay thế jsonwebtoken-----------
// -----------------------------------------------------------------

// const mongoose = require("mongoose");

// const Schema = mongoose.Schema;

// const sessionSchema = new Schema({
//   date: { type: Date },
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: "Users",
//   },
//   expireAt: { type: Date, default: Date.now, expires: 3600 }, // 3600 giây = 60 phút
// });

// sessionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// module.exports = mongoose.model("Sessions", sessionSchema);

//----------------------------------------------------------------
