"use client";

import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import RequestsTable, { RequestRow } from "@/components/tables/RequestsTable";
import Pagination from "@/components/molecules/Pagination";
import StatusDropdown from "@/components/atoms/StatusDropdown";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { RequestStatus } from "@/lib/types/request";
import { PAGINATION_PAGE_SIZE } from "@/lib/constants/config";
import { useState, useEffect } from "react";

/**
 * Admin portal page for managing item requests
 *
 * Features:
 * - Add new requests via form
 * - View requests in paginated table
 * - Filter by status (pending, approved, completed, rejected)
 * - Batch edit status of multiple requests
 * - Batch delete multiple requests
 * - Real-time data fetching from API
 */
export default function ItemRequestsPage() {
  const [requestorName, setRequestorName] = useState<string>("");
  const [itemRequested, setItemRequested] = useState<string>("");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchStatus, setBatchStatus] = useState<RequestStatus | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  /**
   * Fetches requests from the API based on current page and filter
   * Transforms API response to match RequestRow interface
   */
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string with page and optional status filter
      const params = new URLSearchParams({
        page: currentPage.toString(),
      });
      if (selectedTab !== "all") {
        params.append("status", selectedTab);
      }

      const response = await fetch(`/api/request?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data = await response.json();

      // Transform API response to match RequestRow interface
      const transformedData: RequestRow[] = data.requests.map((item: any) => ({
        id: item.id,
        requestorName: item.requestorName,
        itemRequested: item.itemRequested,
        requestCreatedDate: new Date(item.requestCreatedDate),
        lastEditedDate: item.lastEditedDate ? new Date(item.lastEditedDate) : null,
        status: item.status as RequestStatus,
      }));

      setRequests(transformedData);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests when page or tab changes
  useEffect(() => {
    fetchRequests();
  }, [currentPage, selectedTab]);

  // Set mounted state on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Handles creating a new request
   * Validates input, sends to API, and refreshes the table
   */
  const handleAddRequest = async (): Promise<void> => {
    // Validate inputs
    if (!requestorName.trim() || !itemRequested.trim()) {
      alert("Please fill in both Name and Item Requested fields");
      return;
    }

    // Validate name length (3-30 characters)
    if (requestorName.trim().length < 3 || requestorName.trim().length > 30) {
      alert("Name must be between 3 and 30 characters");
      return;
    }

    // Validate item length (2-100 characters)
    if (itemRequested.trim().length < 2 || itemRequested.trim().length > 100) {
      alert("Item requested must be between 2 and 100 characters");
      return;
    }

    try {
      // Send request to API
      const response = await fetch("/api/request", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestorName: requestorName.trim(),
          itemRequested: itemRequested.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create request");
      }

      // Clear form
      setRequestorName("");
      setItemRequested("");

      // Reset to page 1 and refresh the list
      setCurrentPage(1);
      await fetchRequests();
    } catch (err) {
      alert("Failed to create request. Please try again.");
      console.error("Error creating request:", err);
    }
  };

  /**
   * Handles batch editing the status of selected requests
   * Updates all selected items to the new status
   */
  const handleBatchEdit = async (newStatus?: RequestStatus): Promise<void> => {
    if (selectedIds.length === 0 || !newStatus) return;

    try {
      const updates = selectedIds.map((id) => ({ id, status: newStatus }));

      const response = await fetch("/api/request", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error("Failed to batch update requests");
      }

      await response.json();

      // Refresh the list
      await fetchRequests();

      // Clear selection
      setSelectedIds([]);
    } catch (err) {
      alert("Failed to batch update requests. Please try again.");
      console.error("Error batch updating requests:", err);
    }
  };

  /**
   * Handles batch deleting selected requests
   * Deletes all selected items from the database
   */
  const handleBatchDelete = async (): Promise<void> => {
    try {
      const response = await fetch("/api/request", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to batch delete requests");
      }

      await response.json();

      // Refresh the list
      await fetchRequests();

      // Clear selection
      setSelectedIds([]);
    } catch (err) {
      alert("Failed to batch delete requests. Please try again.");
      console.error("Error batch deleting requests:", err);
    }
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: RequestStatus.PENDING, label: "Pending" },
    { id: RequestStatus.APPROVED, label: "Approved" },
    { id: RequestStatus.COMPLETED, label: "Completed" },
    { id: RequestStatus.REJECTED, label: "Rejected" },
  ];

  /**
   * Handles tab change for status filtering
   * Resets to page 1 and clears selection
   */
  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
    setCurrentPage(1); // Reset to page 1 when changing tabs
    setSelectedIds([]); // Clear selection when changing tabs
  };

  /**
   * Handles page navigation
   * Clears selection when changing pages
   */
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSelectedIds([]); // Clear selection when changing pages
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-center">Admin Portal - Item Requests</h1>

      {/* Add Request Form */}
      <div className="bg-white border border-gray-stroke rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add New Request</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter requestor name"
              value={requestorName}
              onChange={(e) => setRequestorName(e.target.value)}
              label="Requestor Name"
            />
          </div>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter item requested"
              value={itemRequested}
              onChange={(e) => setItemRequested(e.target.value)}
              label="Item Requested"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddRequest}>Add Request</Button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-gray-stroke rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-black">Item Requests</h2>
          {mounted && (
            <div className={`flex items-center gap-2 ${selectedIds.length === 0 ? 'opacity-50' : ''}`}>
              <span className="text-gray-500">Mark as</span>
              <div className="w-48">
                <StatusDropdown
                  value={batchStatus}
                  onChange={(newStatus) => {
                    setBatchStatus(newStatus);
                    handleBatchEdit(newStatus);
                  }}
                />
              </div>
              <button
                onClick={handleBatchDelete}
                disabled={selectedIds.length === 0}
                className="p-2 text-gray-500 hover:text-gray-700 transition disabled:cursor-not-allowed"
                title="Delete selected"
              >
                <TrashIcon />
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-danger-fill border border-danger-indicator text-danger-text rounded-md">
            {error}
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-2.5 text-sm rounded-t-sm transition-colors ${
                selectedTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500 hover:bg-blue-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading requests...
          </div>
        ) : (
          <>
            <RequestsTable
              requests={requests}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />

            {/* Pagination */}
            {totalCount > 0 && (
              <div className="mt-4 flex justify-end">
                <Pagination
                  pageNumber={currentPage}
                  pageSize={PAGINATION_PAGE_SIZE}
                  totalRecords={totalCount}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
