// Import Mongoose components for creating the schema and model
import mongoose, { Schema, Document } from "mongoose";
// Import the RequestStatus enum to validate status values
import { RequestStatus } from "@/lib/types/request";

// TypeScript interface defining the shape of a Request document
// Extends Document to get Mongoose document methods and properties
export interface IRequest extends Document {
  requestorName: string;
  itemRequested: string;
  requestCreatedDate: Date;
  lastEditedDate: Date | null;
  status: RequestStatus;
}

// Define the Mongoose schema - this validates and structures the data in MongoDB
const RequestSchema: Schema = new Schema({
  // Requestor name field: required, must be between 3-30 characters (per BACKEND.md)
  requestorName: {
    type: String, // Field type is a string
    required: [true, "Requestor name is required"], // Must be provided, with error message
    trim: true, // Automatically remove leading/trailing whitespace
    minlength: [3, "Requestor name must be at least 3 characters"], // Minimum length validation
    maxlength: [30, "Requestor name must be at most 30 characters"], // Maximum length validation
  },
  // Item requested field: required, must be between 2-100 characters (per BACKEND.md)
  itemRequested: {
    type: String,
    required: [true, "Item requested is required"],
    trim: true, // Remove whitespace
    minlength: [2, "Item requested must be at least 2 characters"],
    maxlength: [100, "Item requested must be at most 100 characters"],
  },
  // Creation date: automatically set to current date when document is created
  requestCreatedDate: {
    type: Date,
    required: true, // Must have a value
    default: Date.now, // Automatically set to current timestamp if not provided
  },
  // Last edited date: optional field (can be null) for tracking updates
  lastEditedDate: {
    type: Date,
    required: false, // Not required - can be omitted
    default: null, // Defaults to null if not provided
  },
  // Status field: must be one of the RequestStatus enum values (pending/approved/completed/rejected)
  status: {
    type: String,
    enum: Object.values(RequestStatus), // Only allow values from the RequestStatus enum
    required: true,
    default: RequestStatus.PENDING, // Defaults to "pending" when creating new requests
  },
});

// Note: MongoDB automatically creates an _id field for each document (unique identifier)
// You can access it as request._id (ObjectId) or request.id (string) in Mongoose

// Export the model, using Next.js-friendly pattern to prevent model recompilation during hot reload
// If the model already exists (from a previous import), reuse it; otherwise, create a new one
export default mongoose.models.Request ||
  mongoose.model<IRequest>("Request", RequestSchema);

