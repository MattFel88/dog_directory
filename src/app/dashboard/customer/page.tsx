'use client';
import { useAuth } from '../../../../lib/authContext';
import Navbar from '../../../components/Navbar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerDashboard() {
  const { session, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login');
    }
  }, [loading, session, router]);

  if (loading) return <div>Loading...</div>;
  if (!session) return null;

  // Only show customer dashboard if correct role
  if (user?.user_metadata?.role !== 'customer') {
    return (
      <>
        <Navbar />
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p>You do not have access to the customer dashboard.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
        <p>Welcome, {user?.email}!</p>
        {/* Add customer-specific content here */}
      </main>
    </>
  );
}
