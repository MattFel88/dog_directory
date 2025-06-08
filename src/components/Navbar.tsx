'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Paws-itivity Logo"
              width={40}
              height={40}
              className="rounded-full border-2 border-green-400"
            />
            <span className="font-bold text-xl text-green-700 tracking-tight">
              Paws-itivity
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/" className="hover:text-green-700 font-medium transition-colors">Home</Link>
          <Link href="/walkers" className="hover:text-green-700 font-semibold transition-colors">
            Find a Walker
          </Link>
          <Link href="/directory" className="hover:text-green-700 font-medium transition-colors">Directory</Link>
          <Link href="/discounts" className="hover:text-green-700 font-medium transition-colors">Discounts</Link>
          <Link href="/events" className="hover:text-green-700 font-medium transition-colors">Events</Link>
          {/* Add login/profile logic here if needed */}
        </div>
      </div>
    </nav>
  );
}
