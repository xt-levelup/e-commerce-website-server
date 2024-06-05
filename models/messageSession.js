// -----------------------------------------------------------------
//--- MODEL CHO CÁC CUỘC TRÒ CHUYỆN (CHAT) -------------------------
// -----------------------------------------------------------------

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: [
    {
      currentMessage: {
        type: String,
      },
      date: { type: Date },
      userChat: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      userChatType: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("MessageSessions", sessionSchema);

// ---------------------------------------------------------------
