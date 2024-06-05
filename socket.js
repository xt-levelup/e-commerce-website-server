// -----------------------------------------------------------
// --- File thiết lập socket.io ------------------------------
// -----------------------------------------------------------
let io;
module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: [
          // "https://..." // Link client thật!
          "http://localhost:3000",
          "http://localhost:3001",
        ],
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
