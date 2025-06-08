import PawIcon from './PawIcon';

export default function BrandButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`
        flex items-center justify-center gap-2
        px-6 py-2
        rounded-full
        bg-[#a3c75c] hover:bg-[#68902b]
        text-white font-bold text-base
        shadow-md
        transition-all duration-150
        active:scale-95
        focus:outline-none
        ${className}
      `}
      {...props}
    >
      <PawIcon className="w-5 h-5 mr-2 -mt-0.5" />
      {children}
    </button>
  );
}
