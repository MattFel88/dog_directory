'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { supabase } from '../../../../lib/supabaseClient';

type Booking = {
  id: string;
  status: string;
  walk_block_id: string;
  dog_id: string;
  created_at?: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useSearchParams();
  const selectedBooking = params?.get('booking');

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: walkerData } = await supabase
        .from('walkers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!walkerData) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const { data: walkBlocks } = await supabase
        .from('walk_blocks')
        .select('id')
        .eq('walker_id', walkerData.id);

      const walkBlockIds = walkBlocks?.map(wb => wb.id) || [];

      const { data: bookingData } = walkBlockIds.length > 0
        ? await supabase
            .from('walker_bookings')
            .select('*')
            .in('walk_block_id', walkBlockIds)
            .order('created_at', { ascending: false })
        : { data: [] };

      setBookings(bookingData || []);
      setLoading(false);
    }
    fetchBookings();
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-[#68902b] mb-8">Your Bookings</h1>
        {loading ? (
          <div className="text-center py-16 text-2xl text-[#68902b]">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center text-lg text-[#68902b] py-16">No bookings found.</div>
        ) : (
          <ul className="space-y-4">
            {bookings.map(bk => (
              <li key={bk.id} className={`p-4 rounded-xl ${selectedBooking === bk.id ? "border-4 border-[#68902b]" : "bg-[#f6f3ee] border-2 border-[#dbc7a1]"}`}>
                <div>
                  <div>Walk Block: <b>{bk.walk_block_id}</b></div>
                  <div>Status: <span className="font-bold">{bk.status}</span></div>
                  <div>
                    Dog: <a href={`/walkers/dogs/${bk.dog_id}`} className="text-[#68902b] underline">View Dog</a>
                  </div>
                  {/* Add Approve/Reject here if you want */}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
