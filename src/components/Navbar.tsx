'use client';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { session, user } = useAuth();
  const router = useRouter();

  // Get user role from metadata
  const role = user?.user_metadata?.role;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <nav className="bg-green-700 text-white px-4 py-3 flex gap-4 items-center">
      <Link href="/" className="font-bold text-xl">Paws-itivity</Link>
      <Link href="/directory">Directory</Link>
      <Link href="/discounts">Discounts</Link>
      <Link href="/walks">Walks</Link>
      <Link href="/events">Events</Link>
      {session ? (
        <>
          {role === 'business' && <Link href="/dashboard/business">Business Dashboard</Link>}
          {role === 'customer' && <Link href="/dashboard/customer">Customer Dashboard</Link>}
          <button
            className="ml-auto bg-white text-green-700 rounded px-3 py-1"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="ml-auto">Sign In</Link>
          <Link href="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}
