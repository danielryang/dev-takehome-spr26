import React from "react";
import StatusBadge from "@/components/atoms/StatusBadge";
import { RequestStatus } from "@/lib/types/request";

/**
 * Interface representing a single request row in the table
 */
export interface RequestRow {
  /** Unique identifier for the request */
  id: string;
  /** Name of the person making the request */
  requestorName: string;
  /** Item being requested */
  itemRequested: string;
  /** Date when the request was created */
  requestCreatedDate: Date;
  /** Date when the request was last edited (null if never edited) */
  lastEditedDate: Date | null;
  /** Current status of the request */
  status: RequestStatus;
}

/**
 * Props for the RequestsTable component
 */
interface RequestsTableProps {
  /** Array of request data to display */
  requests: RequestRow[];
  /** Array of currently selected request IDs */
  selectedIds: string[];
  /** Callback fired when selection changes */
  onSelectionChange: (ids: string[]) => void;
}

/**
 * Table component for displaying item requests with selection functionality
 * Supports individual and bulk selection via checkboxes
 * Selected rows are highlighted with light blue background
 */
export default function RequestsTable({ requests, selectedIds, onSelectionChange }: RequestsTableProps) {
  /**
   * Formats a date to a readable string (e.g., "Jan 1, 2024")
   */
  const formatDate = (date: Date | null): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /**
   * Toggles selection of all rows
   * If any rows are selected, unselects all; otherwise selects all
   */
  const handleSelectAll = () => {
    // If anything is selected, unselect all
    if (selectedIds.length > 0) {
      onSelectionChange([]);
    } else {
      // If nothing is selected, select all
      onSelectionChange(requests.map((r) => r.id));
    }
  };

  /**
   * Handles selection/deselection of a single row
   */
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const anySelected = selectedIds.length > 0;

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-stroke">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-y border-gray-stroke px-4 py-2 text-center text-gray-500 font-normal w-12">
              <div className="flex items-center justify-center">
                {anySelected ? (
                  <button
                    onClick={handleSelectAll}
                    className="w-5 h-5 cursor-pointer bg-white border-2 border-primary rounded-md flex items-center justify-center hover:bg-blue-50"
                  >
                    <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
                      <path d="M1 1H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
                    </svg>
                  </button>
                ) : (
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={handleSelectAll}
                    className="w-5 h-5 cursor-pointer appearance-none border-2 border-gray-300 rounded-md hover:bg-blue-50"
                  />
                )}
              </div>
            </th>
            <th className="border-y border-gray-stroke px-4 py-2 text-left text-gray-500 font-normal">Name</th>
            <th className="border-y border-gray-stroke px-4 py-2 text-left text-gray-500 font-normal">Item Requested</th>
            <th className="border-y border-gray-stroke px-4 py-2 text-left text-gray-500 font-normal">Created</th>
            <th className="border-y border-gray-stroke px-4 py-2 text-left text-gray-500 font-normal">Updated</th>
            <th className="border-y border-gray-stroke px-4 py-2 text-left text-gray-500 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan={6} className="border-y border-gray-stroke px-4 py-8 text-center text-gray-500">
                No requests yet. Add one above!
              </td>
            </tr>
          ) : (
            requests.map((request) => {
              const isSelected = selectedIds.includes(request.id);
              return (
                <tr key={request.id}>
                  <td className="border-y border-gray-stroke px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(request.id, e.target.checked)}
                      className="w-5 h-5 cursor-pointer appearance-none border-2 border-gray-300 rounded-md hover:bg-blue-50 checked:bg-primary checked:border-primary checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMC42NjY3IDFMNC4wMDAwNCA3LjY2NjY3TDEuMzMzMzcgNSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-center bg-no-repeat"
                    />
                  </td>
                  <td className={`border-y border-gray-stroke px-4 py-2 text-gray-500 ${isSelected ? 'bg-blue-50' : ''}`}>{request.requestorName}</td>
                  <td className={`border-y border-gray-stroke px-4 py-2 text-gray-500 ${isSelected ? 'bg-blue-50' : ''}`}>{request.itemRequested}</td>
                  <td className={`border-y border-gray-stroke px-4 py-2 text-gray-500 ${isSelected ? 'bg-blue-50' : ''}`}>{formatDate(request.requestCreatedDate)}</td>
                  <td className={`border-y border-gray-stroke px-4 py-2 text-gray-500 ${isSelected ? 'bg-blue-50' : ''}`}>{formatDate(request.lastEditedDate)}</td>
                  <td className={`border-y border-gray-stroke px-4 py-2 ${isSelected ? 'bg-blue-50' : ''}`}>
                    <StatusBadge status={request.status} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
