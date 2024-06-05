const cron = require("cron");

const https = require("https");

const backendUrl = "https://test-server-deploy-socketio.onrender.com/";

const job = new cron.CronJob("*/14 * * * *", () => {
  // Lệnh này sẽ chạy sau mỗi 14 phút
  console.log("Restarting Server...");

  //  Lệnh này sẽ chạy backend server
  https
    .get(backendUrl, (res) => {
      if (res.statusCode === 200) {
        console.log("Server Started!");
      } else {
        console.error(
          `Failed to restart server with status code: ${res.statusCode}`
        );
      }
    })
    .on("error", (err) => {
      console.log("Error during Restart:", err.message);
    });
});

module.exports = {
  job,
};
