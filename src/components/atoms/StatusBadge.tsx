import { RequestStatus } from "@/lib/types/request";

/**
 * Props for the StatusBadge component
 */
interface StatusBadgeProps {
  /** The request status to display */
  status: RequestStatus;
}

/**
 * Displays a status badge with color-coded styling
 * Shows a colored dot and capitalized status label
 * - Pending: orange
 * - Approved: yellow
 * - Completed: green
 * - Rejected: red
 */
export default function StatusBadge({ status }: StatusBadgeProps) {
  /**
   * Returns Tailwind CSS classes for the given status
   */
  const getStatusStyles = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return {
          bg: "bg-orange-100",
          text: "text-orange-800",
          dot: "bg-orange-500",
        };
      case RequestStatus.APPROVED:
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          dot: "bg-yellow-500",
        };
      case RequestStatus.COMPLETED:
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          dot: "bg-green-500",
        };
      case RequestStatus.REJECTED:
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          dot: "bg-red-500",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          dot: "bg-gray-500",
        };
    }
  };

  const styles = getStatusStyles(status);
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${styles.bg}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></div>
      <span className={`${styles.text} font-medium text-xs`}>{label}</span>
    </div>
  );
}
