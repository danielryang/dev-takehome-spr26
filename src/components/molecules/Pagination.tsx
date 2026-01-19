import { PaginationProps } from "@/lib/types/props/pagination";
import { RightArrowIcon } from "../icons/RightArrowIcon";
import { LeftArrowIcon } from "../icons/LeftArrowIcon";

/**
 * Clickable arrow button for pagination navigation
 * Always visible but disabled when at start/end of pages
 */
const ArrowButton = ({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <div
    className="w-8 h-8 p-1 bg-gray-fill-light rounded border border-gray-stroke justify-center items-center inline-flex cursor-pointer"
    onClick={disabled ? undefined : onClick}
  >
    {children}
  </div>
);

/**
 * Pagination component displaying current page range and navigation
 * Shows "X - Y of Total" with left/right arrow buttons
 */
export default function Pagination({
  pageNumber,
  pageSize,
  totalRecords,
  onPageChange,
}: PaginationProps) {
  const firstRecordOnPage = (pageNumber - 1) * pageSize + 1;
  const lastRecordOnPage = Math.min(
    firstRecordOnPage + pageSize - 1,
    totalRecords
  );

  const isValidPage =
    firstRecordOnPage > 0 && firstRecordOnPage <= totalRecords;

  if (!isValidPage) {
    return <></>;
  }

  return (
    <div className="justify-start items-center gap-4 inline-flex text-gray-text">
      {firstRecordOnPage} - {lastRecordOnPage} of {totalRecords}
      <div className="inline-flex gap-2">
        <ArrowButton
          onClick={() => {
            onPageChange(pageNumber - 1);
          }}
          disabled={firstRecordOnPage <= 1}
        >
          <LeftArrowIcon />
        </ArrowButton>
        <ArrowButton
          onClick={() => {
            onPageChange(pageNumber + 1);
          }}
          disabled={lastRecordOnPage >= totalRecords}
        >
          <RightArrowIcon />
        </ArrowButton>
      </div>
    </div>
  );
}
