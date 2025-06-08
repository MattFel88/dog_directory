export default function PawIcon({
  className = "inline w-5 h-5 mr-2 -mt-0.5",
  color = "#fff",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      {/* Four toes */}
      <circle cx="8" cy="10" r="3" fill={color} />
      <circle cx="24" cy="10" r="3" fill={color} />
      <circle cx="16" cy="7" r="3" fill={color} />
      <circle cx="16" cy="19" r="3" fill="none" />
      {/* Main pad */}
      <ellipse cx="16" cy="20" rx="7" ry="8" fill={color} />
    </svg>
  );
}
