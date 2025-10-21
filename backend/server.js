require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { initReviewSocket } = require("./socket/review_socket");
const { initTrackingSocket } = require("./socket/tracking_socket");

const app = express();
connectDB();

app.use(express.json({ 
  limit: "10mb"
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: "10mb" 
}));

app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ["http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(mongoSanitize());
app.use(compression());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, 
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many AI requests, please wait a moment"
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(generalLimiter);
app.use("/users/login", authLimiter);
app.use("/users/register", authLimiter);
app.use("/ai", aiLimiter);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

app.use("/users", require("./routes/user_routes"));
app.use("/vendors", require("./routes/vendor_routes"));
app.use("/bookings", require("./routes/booking_routes"));
app.use("/tracking", require("./routes/tracking_routes"));
app.use("/ai", require("./routes/ai_routes"));
app.use("/reviews", require("./routes/review_routes")); 

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running smoothly",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FixItNow Repair Service Marketplace API",
    version: "1.0.0",
    documentation: "/api-docs",
    status: "operational"
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.use(require("./middlewares/errorHandler"));

process.on("unhandledRejection", (err, promise) => {
  console.log(`Unhandled Rejection at: ${promise}, Reason: ${err.message}`);
  console.error(err.stack);
  server.close(() => {
    console.log('Server closed due to unhandled rejection');
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
    Server running in ${process.env.NODE_ENV || 'development'} mode
    Port: ${PORT}
    Started at: ${new Date().toISOString()}
    Health check: http://localhost:${PORT}/health
  `);
});

const io = require("socket.io")(server, {
  cors: {
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

initTrackingSocket(io);
initReviewSocket(io);
console.log('Socket.io initialized for real-time rendering');

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});