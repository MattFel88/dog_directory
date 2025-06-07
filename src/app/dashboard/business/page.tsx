'use client';
import { useAuth } from '../../../../lib/authContext';
import Navbar from '../../../components/Navbar';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessDashboard() {
  const { session, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login');
    }
  }, [loading, session, router]);

  if (loading) return <div>Loading...</div>;
  if (!session) return null;

  // Only show dashboard if correct role
  if (user?.user_metadata?.role !== 'business') {
    return (
      <>
        <Navbar />
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p>You do not have access to the business dashboard.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Business Dashboard</h1>
        <p>Welcome, {user?.email}!</p>
        <Link
          href="/dashboard/business/listing"
          className="inline-block mt-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
        >
          Edit My Listing
        </Link>
        <Link
         href="/dashboard/business/discounts"
         className="inline-block mt-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
        >
        Manage Discounts
        </Link>

        {/* Add other business-specific content here */}
      </main>
    </>
  );
}
