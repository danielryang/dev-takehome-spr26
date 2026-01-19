import React from "react";

/**
 * Props for the Dropdown component
 */
interface DropdownProps {
    /** Callback fired when selection changes */
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Currently selected value */
    value: string;
    /** Array of dropdown options */
    options: { value: string; label: string }[];
}

/**
 * Generic dropdown/select component with consistent styling
 * Uses native HTML select element for accessibility
 */
export default function Dropdown({ onChange, value, options }: DropdownProps) {
    return (
    <select className="w-full bg-primary-fill border border-gray-stroke outline-gray-stroke text-gray-text px-3 py-2 rounded-md" onChange={onChange} value={value}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );}