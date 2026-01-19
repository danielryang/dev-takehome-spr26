import React from "react";

/**
 * Available button style variants
 */
type ButtonVariant = "primary" | "inverted";

/**
 * Props for the Button component
 */
interface ButtonProps {
  /** Visual style variant (default: "primary") */
  variant?: ButtonVariant;
  /** HTML button type attribute (default: "button") */
  type?: "button" | "submit" | "reset";
  /** Click event handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Content to display inside the button */
  children: React.ReactNode;
  /** Whether the button is disabled (default: false) */
  disabled?: boolean;
}

/**
 * Reusable button component with consistent styling
 * Supports primary and inverted variants with hover states
 */
export default function Button({
  variant = "primary",
  type = "button",
  onClick,
  children,
  disabled = false,
}: ButtonProps) {
  const baseStyles = "py-2 px-4 rounded-md transition w-full ";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-primary border border-primary text-white hover:bg-white hover:text-primary",
    inverted:
      "bg-primary-fill text-primary border border-white hover:bg-primary hover:text-white",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${disabled ? disabledStyles : ""}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
