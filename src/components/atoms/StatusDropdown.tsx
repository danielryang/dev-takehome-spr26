import { useState, useRef, useEffect } from "react";
import { RequestStatus } from "@/lib/types/request";
import StatusBadge from "./StatusBadge";

/**
 * Props for the StatusDropdown component
 */
interface StatusDropdownProps {
  /** Currently selected status (optional) */
  value?: RequestStatus;
  /** Callback fired when a status is selected */
  onChange: (status: RequestStatus) => void;
}

/**
 * Dropdown menu for selecting a request status
 * Displays status badges as options and closes on outside click
 * Shows "Status" placeholder when no value is selected
 */
export default function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statuses = [
    RequestStatus.PENDING,
    RequestStatus.APPROVED,
    RequestStatus.COMPLETED,
    RequestStatus.REJECTED,
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (status: RequestStatus) => {
    onChange(status);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-stroke rounded-md px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition"
      >
        {value ? (
          <StatusBadge status={value} />
        ) : (
          <span className="text-gray-500">Status</span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-stroke rounded-md shadow-lg max-h-60 overflow-auto">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleSelect(status)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 transition flex items-center"
            >
              <StatusBadge status={status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
