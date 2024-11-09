import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// MongoDB connection settings
const mongoURI = process.env.MONGODB_URI;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  poolSize: process.env.MONGO_POOL_SIZE || 10, // Maintain up to 10 socket connections
  ssl: process.env.MONGO_SSL === "true", // Enable SSL if needed
  retryWrites: process.env.MONGO_RETRY_WRITES === "true", // Retry writes if they fail
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  reconnectTries: process.env.MONGO_RECONNECT_TRIES || Number.MAX_VALUE, // Try to reconnect indefinitely
  reconnectInterval: process.env.MONGO_RECONNECT_INTERVAL || 5000, // Reconnect every 5 seconds
  family: 4, // Use IPv4, skip trying IPv6
};

// Connection event handlers
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected from MongoDB");
});

// Close Mongoose connection when the application terminates
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed due to application termination");
  process.exit(0);
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
};

export default connectDB;
