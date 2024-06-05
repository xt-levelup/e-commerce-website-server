// -----------------------------------------------------------
// --- File thiết lập socket.io ------------------------------
// -----------------------------------------------------------
let io;
module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: [
          "https://e-commerce-website-server-p2i7.onrender.com", // Link client thật!
          "https://e-commerce-admin-453bd.web.app/",
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
