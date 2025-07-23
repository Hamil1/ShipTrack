"use client";

interface CarrierBadgeProps {
  carrier: string;
  className?: string;
}

export default function CarrierBadge({
  carrier,
  className = "",
}: CarrierBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}
    >
      {carrier}
    </span>
  );
}
