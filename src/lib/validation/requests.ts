/* eslint-disable @typescript-eslint/no-explicit-any */
// ^ disable rules because we are validating anys to make sure it conforms else erroring

import { RequestStatus } from "@/lib/types/request";

/**
 * Interface for creating a new request (input validation)
 */
export interface CreateItemRequest {
  requestorName: string;
  itemRequested: string;
}

/**
 * Interface for editing a request status (input validation)
 */
export interface EditStatusRequest {
  id: string;
  status: RequestStatus;
}

/**
 * Interface for batch editing request statuses (input validation)
 */
export interface BatchEditStatusRequest {
  updates: EditStatusRequest[];
}

/**
 * Interface for batch deleting requests (input validation)
 */
export interface BatchDeleteRequest {
  ids: string[];
}

/**
 * Validates if a string meets length requirements
 * @param str - The string to validate
 * @param lower - Minimum length (optional)
 * @param upper - Maximum length (optional)
 * @returns true if valid, false otherwise
 */
function isValidString(str: any, lower?: number, upper?: number): boolean {
  if (typeof str !== "string" || str.trim() === "") {
    return false;
  }
  if ((lower && str.length < lower) || (upper && str.length > upper)) {
    return false;
  }
  return true;
}

/**
 * Validates requestor name (3-30 characters)
 */
function isValidName(name: string): boolean {
  return isValidString(name, 3, 30);
}

/**
 * Validates item requested (2-100 characters)
 */
function isValidItemRequested(item: string): boolean {
  return isValidString(item, 2, 100);
}

/**
 * Validates and parses a create item request
 * @param request - The request object to validate
 * @returns Validated CreateItemRequest or null if invalid
 */
export function validateCreateItemRequest(
  request: any
): CreateItemRequest | null {
  // Check if required fields are present
  if (!request.requestorName || !request.itemRequested) {
    return null;
  }
  
  // Validate field lengths
  if (
    !isValidName(request.requestorName) ||
    !isValidItemRequested(request.itemRequested)
  ) {
    return null;
  }
  
  // Return validated request
  const validatedRequest: CreateItemRequest = {
    requestorName: request.requestorName.trim(), // Trim whitespace
    itemRequested: request.itemRequested.trim(), // Trim whitespace
  };
  return validatedRequest;
}

/**
 * Validates if a status is valid
 * @param status - The status to validate
 * @returns true if valid, false otherwise
 */
function isValidStatus(status: any): status is RequestStatus {
  return Object.values(RequestStatus).includes(status);
}

/**
 * Validates and parses an edit status request
 * @param request - The request object to validate
 * @returns Validated EditStatusRequest or null if invalid
 */
export function validateEditStatusRequest(
  request: any
): EditStatusRequest | null {
  // Check if required fields are present
  if (!request.id || !request.status) {
    return null;
  }

  // Validate id is a string
  if (typeof request.id !== "string" || request.id.trim() === "") {
    return null;
  }

  // Validate status is valid
  if (!isValidStatus(request.status)) {
    return null;
  }

  // Return validated request
  const validatedRequest: EditStatusRequest = {
    id: request.id.trim(),
    status: request.status,
  };
  return validatedRequest;
}

/**
 * Validates and parses a batch edit status request
 * @param request - The request object to validate
 * @returns Validated BatchEditStatusRequest or null if invalid
 */
export function validateBatchEditStatusRequest(
  request: any
): BatchEditStatusRequest | null {
  // Check if updates array exists and is an array
  if (!request.updates || !Array.isArray(request.updates)) {
    return null;
  }

  // Validate that updates array is not empty
  if (request.updates.length === 0) {
    return null;
  }

  // Validate each update in the array
  const validatedUpdates: EditStatusRequest[] = [];
  for (const update of request.updates) {
    const validatedUpdate = validateEditStatusRequest(update);
    if (!validatedUpdate) {
      return null; // If any update is invalid, reject the entire batch
    }
    validatedUpdates.push(validatedUpdate);
  }

  return {
    updates: validatedUpdates,
  };
}

/**
 * Validates and parses a batch delete request
 * @param request - The request object to validate
 * @returns Validated BatchDeleteRequest or null if invalid
 */
export function validateBatchDeleteRequest(
  request: any
): BatchDeleteRequest | null {
  // Check if ids array exists and is an array
  if (!request.ids || !Array.isArray(request.ids)) {
    return null;
  }

  // Validate that ids array is not empty
  if (request.ids.length === 0) {
    return null;
  }

  // Validate each id is a non-empty string
  const validatedIds: string[] = [];
  for (const id of request.ids) {
    if (typeof id !== "string" || id.trim() === "") {
      return null; // If any id is invalid, reject the entire batch
    }
    validatedIds.push(id.trim());
  }

  return {
    ids: validatedIds,
  };
}

