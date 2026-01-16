import { ServerResponseBuilder } from "@/lib/builders/serverResponseBuilder";
import { ResponseType } from "@/lib/types/apiResponse";
import { InputException } from "@/lib/errors/inputExceptions";
import { getItemRequests, createNewRequest, updateRequestStatus, batchUpdateRequestStatuses, batchDeleteRequests } from "@/server/requests";
import { RequestStatus } from "@/lib/types/request";

/**
 * GET /api/request
 * 
 * Returns all item requests in the database, paginated and sorted by creation date (descending)
 * 
 * Query parameters:
 * - page (optional): Page number (defaults to 1 if not specified)
 * - status (optional): Status to filter by (defaults to all statuses if not specified) and sorted by creation date (descending)
 *   - pending
 *   - approved
 *   - completed
 *   - rejected
 * 
 * @param request - The incoming request object
 * @returns Response with paginated array of item requests
 */
export async function GET(request: Request) {
  try {
    // Parse the URL to get query parameters
    const url = new URL(request.url);
    // Get page parameter, default to "1" if not provided, then parse to integer
    const page = parseInt(url.searchParams.get("page") || "1");

    const status = url.searchParams.get("status");

    // Get paginated requests from the database
    // Results are sorted by creation date descending (newest first)
    const { requests, totalCount } = await getItemRequests(page, status || undefined);

    // Return the requests and pagination info as JSON
    return new Response(JSON.stringify({
      requests,
      totalCount,
      page,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // Log the error for debugging
    console.error("Error in GET /api/request:", e);
    // Handle input validation errors
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    // Handle any other errors
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}

/**
 * PUT /api/request
 * 
 * Creates a new item request in the database
 * 
 * Request body format:
 * {
 *   requestorName: "Jane Doe",
 *   itemRequested: "Flashlights"
 * }
 * 
 * Automatically sets:
 * - creation date: current date
 * - last edited date: current date
 * - status: "pending"
 * 
 * @param request - The incoming request object
 * @returns Response with the created item request (status 201)
 */
export async function PUT(request: Request) {
  try {
    // Parse the request body as JSON
    const req = await request.json();
    
    // Create the new request in the database
    // This will validate the input and throw InvalidInputError if invalid
    const newRequest = await createNewRequest(req);
    
    // Return the created request with 201 status code
    return new Response(JSON.stringify(newRequest), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // Log the error for debugging
    console.error("Error in PUT /api/request:", e);
    // Handle input validation errors
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    // Handle any other errors
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}

/**
 * PATCH /api/request
 *
 * Updates the status of one or more item requests in the database
 *
 * Single update request body format:
 * {
 *   id: "507f1f77bcf86cd799439011",
 *   status: "approved"
 * }
 *
 * Batch update request body format:
 * {
 *   updates: [
 *     { id: "507f1f77bcf86cd799439011", status: "approved" },
 *     { id: "507f191e810c19729de860ea", status: "rejected" }
 *   ]
 * }
 *
 * Valid statuses: pending, approved, completed, rejected
 * Automatically updates lastEditedDate to current date
 *
 * @param request - The incoming request object
 * @returns Response with the updated item request(s) (status 200)
 */
export async function PATCH(request: Request) {
  try {
    // Parse the request body as JSON
    const req = await request.json();

    // Check if this is a batch update (has "updates" array) or single update
    if (req.updates && Array.isArray(req.updates)) {
      // Batch update
      const result = await batchUpdateRequestStatuses(req);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Single update
      const updatedRequest = await updateRequestStatus(req);
      return new Response(JSON.stringify(updatedRequest), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    // Log the error for debugging
    console.error("Error in PATCH /api/request:", e);
    // Handle input validation errors
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    // Handle any other errors
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}

/**
 * DELETE /api/request
 *
 * Deletes one or more item requests from the database
 *
 * Request body format:
 * {
 *   ids: [
 *     "507f1f77bcf86cd799439011",
 *     "507f191e810c19729de860ea",
 *     "507f191e810c19729de860eb"
 *   ]
 * }
 *
 * Returns:
 * {
 *   deletedCount: 2,
 *   failed: ["507f191e810c19729de860eb"]
 * }
 *
 * @param request - The incoming request object
 * @returns Response with deletion results (status 200)
 */
export async function DELETE(request: Request) {
  try {
    // Parse the request body as JSON
    const req = await request.json();

    // Delete the requests from the database
    // This will validate the input and throw InvalidInputError if invalid
    const result = await batchDeleteRequests(req);

    // Return the deletion results with 200 status code
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // Log the error for debugging
    console.error("Error in DELETE /api/request:", e);
    // Handle input validation errors
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    // Handle any other errors
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}