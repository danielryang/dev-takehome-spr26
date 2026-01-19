/* eslint-disable @typescript-eslint/no-explicit-any */
// ^ disable rules because we are validating anys to make sure it conforms else erroring
import connectDB from "@/lib/db/mongodb";
import RequestModel from "@/server/models/request.model";
import { PAGINATION_PAGE_SIZE } from "@/lib/constants/config";
import { IRequest } from "@/server/models/request.model";
import { InvalidInputError } from "@/lib/errors/inputExceptions";
import { RequestStatus } from "@/lib/types/request";
import { validateCreateItemRequest, validateEditStatusRequest, validateBatchEditStatusRequest, validateBatchDeleteRequest } from "@/lib/validation/requests";

/**
 * Interface for a request item returned from the database
 * Converts MongoDB _id to string id and transforms the document
 */
export interface ItemRequest {
  id: string; // MongoDB _id converted to string
  requestorName: string;
  itemRequested: string;
  requestCreatedDate: Date;
  lastEditedDate: Date | null;
  status: string;
}

/**
 * Get paginated item requests from the database
 * Returns requests sorted by creation date (descending - newest first)
 * This corresponds to the GET /api/request endpoint
 *
 * Query parameters:
 * - page (optional): Page number (defaults to 1 if not specified)
 * - status (optional): Status to filter by (defaults to all statuses if not specified) and sorted by creation date (descending)
 *   - pending
 *   - approved
 *   - completed
 *   - rejected
 *
 * @param page - Page number (1-indexed), defaults to 1 if not provided
 * @param status - Optional status to filter by
 * @returns Object containing array of item requests and total count
 */
export async function getItemRequests(
  page: number = 1,
  status?: string
): Promise<{ requests: ItemRequest[]; totalCount: number }> {
  // Connect to the database
  await connectDB();

  // Build query filter
  const filter: any = {};
  if (status) {
    filter.status = status;
  }

  // Calculate skip value for pagination (MongoDB uses skip/limit)
  const skip = (page - 1) * PAGINATION_PAGE_SIZE;

  // Get total count for pagination
  const totalCount = await RequestModel.countDocuments(filter);

  // Query the database: sort by requestCreatedDate descending, then paginate
  const requests = await RequestModel.find(filter)
    .sort({ requestCreatedDate: -1 }) // -1 means descending (newest first)
    .skip(skip) // Skip documents for previous pages
    .limit(PAGINATION_PAGE_SIZE) // Limit to page size
    .lean() // Convert to plain JavaScript objects (faster, no Mongoose document overhead)
    .exec();

  // Transform MongoDB documents to the expected format
  // Convert _id (ObjectId) to id (string) and format the response
  const transformedRequests = requests.map((request: any) => ({
    id: request._id.toString(), // Convert ObjectId to string
    requestorName: request.requestorName,
    itemRequested: request.itemRequested,
    requestCreatedDate: request.requestCreatedDate,
    lastEditedDate: request.lastEditedDate,
    status: request.status,
  }));

  return {
    requests: transformedRequests,
    totalCount,
  };
}

/**
 * Create a new item request in the database
 * Sets creation date, last edited date to current date, and status to pending
 * This corresponds to the PUT /api/request endpoint
 *
 * Request body format:
 * {
 *   requestorName: "Jane Doe",
 *   itemRequested: "Flashlights"
 * }
 *
 * @param request - The request data to create
 * @returns The created item request
 * @throws InvalidInputError if validation fails
 */
export async function createNewRequest(request: any): Promise<ItemRequest> {
  // Validate the input request
  const validatedRequest = validateCreateItemRequest(request);
  if (!validatedRequest) {
    throw new InvalidInputError("created item request");
  }

  // Connect to the database
  await connectDB();

  // Get current date for creation and last edited date
  const currentDate = new Date();

  // Create the new request document
  // Mongoose schema will automatically set defaults for status (pending) and requestCreatedDate
  // But we'll explicitly set them to match the requirements
  const newRequest = new RequestModel({
    requestorName: validatedRequest.requestorName,
    itemRequested: validatedRequest.itemRequested,
    requestCreatedDate: currentDate,
    lastEditedDate: currentDate, // Set to current date per BACKEND.md requirements
    status: RequestStatus.PENDING, // Set to pending per BACKEND.md requirements
  });

  // Save to database
  const savedRequest = await newRequest.save();

  // Transform to the expected format and return
  return {
    id: savedRequest._id.toString(), // Convert ObjectId to string
    requestorName: savedRequest.requestorName,
    itemRequested: savedRequest.itemRequested,
    requestCreatedDate: savedRequest.requestCreatedDate,
    lastEditedDate: savedRequest.lastEditedDate,
    status: savedRequest.status,
  };
}

/**
 * Update the status of an existing item request in the database
 * Updates the lastEditedDate to current date
 * This corresponds to the PATCH /api/request endpoint
 * 
 * Request body format:
 * {
 *   id: ________,
 *   status: approved
 * }
 *
 * @param request - The request data containing id and new status
 * @returns The updated item request
 * @throws InvalidInputError if validation fails or request not found
 */
export async function updateRequestStatus(request: any): Promise<ItemRequest> {
  // Validate the input request
  const validatedRequest = validateEditStatusRequest(request);
  if (!validatedRequest) {
    throw new InvalidInputError("edit item request");
  }

  // Connect to the database
  await connectDB();

  // Get current date for last edited date
  const currentDate = new Date();

  // Find and update the request
  const updatedRequest = await RequestModel.findByIdAndUpdate(
    validatedRequest.id,
    {
      status: validatedRequest.status,
      lastEditedDate: currentDate,
    },
    { new: true } // Return the updated document
  ).exec();

  // If request not found, throw error
  if (!updatedRequest) {
    throw new InvalidInputError("edit item ID");
  }

  // Transform to the expected format and return
  return {
    id: updatedRequest._id.toString(),
    requestorName: updatedRequest.requestorName,
    itemRequested: updatedRequest.itemRequested,
    requestCreatedDate: updatedRequest.requestCreatedDate,
    lastEditedDate: updatedRequest.lastEditedDate,
    status: updatedRequest.status,
  };
}

/**
 * Batch update the status of multiple item requests in the database
 * Updates the lastEditedDate to current date for all updated requests
 *
 * @param request - The request data containing array of updates
 * @returns Object with successful updates and failed IDs
 * @throws InvalidInputError if validation fails
 */
export async function batchUpdateRequestStatuses(request: any): Promise<{
  updated: ItemRequest[];
  failed: string[];
}> {
  // Validate the input request
  const validatedRequest = validateBatchEditStatusRequest(request);
  if (!validatedRequest) {
    throw new InvalidInputError("batch edit item request");
  }

  // Connect to the database
  await connectDB();

  // Get current date for last edited date
  const currentDate = new Date();

  const updated: ItemRequest[] = [];
  const failed: string[] = [];

  // Process each update
  for (const update of validatedRequest.updates) {
    try {
      const updatedRequest = await RequestModel.findByIdAndUpdate(
        update.id,
        {
          status: update.status,
          lastEditedDate: currentDate,
        },
        { new: true }
      ).exec();

      if (!updatedRequest) {
        failed.push(update.id);
      } else {
        updated.push({
          id: updatedRequest._id.toString(),
          requestorName: updatedRequest.requestorName,
          itemRequested: updatedRequest.itemRequested,
          requestCreatedDate: updatedRequest.requestCreatedDate,
          lastEditedDate: updatedRequest.lastEditedDate,
          status: updatedRequest.status,
        });
      }
    } catch (error) {
      failed.push(update.id);
    }
  }

  return { updated, failed };
}

/**
 * Batch delete multiple item requests from the database
 *
 * @param request - The request data containing array of IDs to delete
 * @returns Object with count of deleted items and failed IDs
 * @throws InvalidInputError if validation fails
 */
export async function batchDeleteRequests(request: any): Promise<{
  deletedCount: number;
  failed: string[];
}> {
  // Validate the input request
  const validatedRequest = validateBatchDeleteRequest(request);
  if (!validatedRequest) {
    throw new InvalidInputError("batch delete request");
  }

  // Connect to the database
  await connectDB();

  const failed: string[] = [];
  let deletedCount = 0;

  // Process each deletion
  for (const id of validatedRequest.ids) {
    try {
      const result = await RequestModel.findByIdAndDelete(id).exec();

      if (!result) {
        failed.push(id);
      } else {
        deletedCount++;
      }
    } catch (error) {
      failed.push(id);
    }
  }

  return { deletedCount, failed };
}

