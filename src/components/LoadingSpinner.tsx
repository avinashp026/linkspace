
import { LoaderCircle } from "lucide-react";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  return (
    <LoaderCircle
      size={sizes[size]}
      strokeWidth={2.5}
      aria-hidden="true"
      className={`shrink-0 animate-spin ${className}`}
    />
  );
}
