const Tracking = require("../models/Tracking");

let ioRef = null;
function initTrackingSocket(io) {
  ioRef = io;

  io.on("connection", (socket) => {
    socket.on("joinBooking", (bookingId) => {
      if (!bookingId) return;
      socket.join(bookingId.toString());
    });

    socket.on("updateLocation", async ({ bookingId, lat, lon }) => {
      if (!bookingId) return;
      try {
        await Tracking.findOneAndUpdate(
          { bookingId },
          { $set: { liveLocation: { lat, lon } } },
          { upsert: false }
        );
        ioRef.to(bookingId.toString()).emit("locationUpdate", { lat, lon });
      } catch (err) {
        console.error("updateLocation err:", err);
      }
    });

    socket.on("updateStatus", async ({ bookingId, status }) => {
      if (!bookingId || !status) return;
      try {
        await Tracking.findOneAndUpdate(
          { bookingId },
          { $push: { timeline: { status, timeStamp: new Date() } } },
          { upsert: false }
        );
        ioRef.to(bookingId.toString()).emit("statusUpdate", { status, timeStamp: new Date() });
      } catch (err) {
        console.error("updateStatus err:", err);
      }
    });
  });
}

function getIO() {
  if (!ioRef) throw new Error("Socket.io not initialized");
  return ioRef;
}

module.exports = { initTrackingSocket, getIO };
