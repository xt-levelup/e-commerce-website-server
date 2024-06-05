// -----------------------------------------------------------
// --- File thiết lập socket.io ------------------------------
// -----------------------------------------------------------
let io;
module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        cors: {
          origin: "*",
        },
        methods: ["GET", "POST", "DELETE", "PUT"],
      },
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("SocketIO not initialized!");
    }
    return io;
  },
};
