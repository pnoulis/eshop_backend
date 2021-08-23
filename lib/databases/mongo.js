import mongoose from "mongoose";
import config from "#config";

const connectionString = config.credentials.mongo.connectionString;

// Make sure connection string is there
if (!connectionString) {
  throw new Error("Mongodb connection string missing from .credentials file!");
}

// Declare mongoose Options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
};

// Establish connection
mongoose.connect(connectionString, mongooseOptions);

// Create db object on connection
const mongoClient = mongoose.connection;


export {mongoClient};
