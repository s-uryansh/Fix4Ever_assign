let ioRef = null;

function initReviewSocket(io) {
  ioRef = io;

  io.on("connection", (socket) => {
    // console.log('Client connected to review socket:', socket.id);

    socket.on("joinServiceReviews", (serviceId) => {
      if (serviceId) {
        socket.join(`service-reviews-${serviceId}`);
        // console.log(`Socket ${socket.id} joined service-reviews-${serviceId}`);
      }
    });

    socket.on("joinVendorReviews", (vendorId) => {
      if (vendorId) {
        socket.join(`vendor-reviews-${vendorId}`);
        // console.log(`Socket ${socket.id} joined vendor-reviews-${vendorId}`);
      }
    });

    socket.on("joinTechnicianReviews", (technicianId) => {
      if (technicianId) {
        socket.join(`technician-reviews-${technicianId}`);
        // console.log(`Socket ${socket.id} joined technician-reviews-${technicianId}`);
      }
    });


    socket.on("disconnect", () => {
      // console.log('Client disconnected from review socket:', socket.id);
    });
  });
}

function broadcastNewReview(review) {
  if (!ioRef) {
    // console.log('Socket.io not initialized for reviews');
    return;
  }

  try {
    // console.log('Broadcasting new review:', review);
    
    if (review.serviceId) {
      ioRef.to(`service-reviews-${review.serviceId}`).emit('newServiceReview', review);
      // console.log(`Broadcasted to service-reviews-${review.serviceId}`);
    } else if (review.vendorId) {
      ioRef.to(`vendor-reviews-${review.vendorId}`).emit('newVendorReview', review);
      // console.log(`Broadcasted to vendor-reviews-${review.vendorId}`);
    } else if (review.technicianId) {
      ioRef.to(`technician-reviews-${review.technicianId}`).emit('newTechnicianReview', review);
      // console.log(`Broadcasted to technician-reviews-${review.technicianId}`);
    }
  } catch (error) {
    // console.error('Error broadcasting review:', error);
  }
}

module.exports = { initReviewSocket, broadcastNewReview };