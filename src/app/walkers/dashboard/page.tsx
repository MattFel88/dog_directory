'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../../components/Navbar';
import { supabase } from '../../../../lib/supabaseClient';

type Walker = {
  id: string;
  user_id: string;
  name: string;
  photo_url?: string;
  about?: string;
};

type WalkBlock = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  is_group: boolean;
};

type Booking = {
  id: string;
  status: string;
  walk_block_id: string;
  dog_id: string;
};

export default function WalkerDashboard() {
  const [walker, setWalker] = useState<Walker | null>(null);
  const [walks, setWalks] = useState<WalkBlock[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchWalkerData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: walkerData } = await supabase
        .from('walkers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!walkerData) {
        setWalker(null);
        setWalks([]);
        setBookings([]);
        setLoading(false);
        return;
      }

      setWalker(walkerData);

      const { data: walkBlocks } = await supabase
        .from('walk_blocks')
        .select('id, title, date, start_time, end_time, is_group')
        .eq('walker_id', walkerData.id)
        .gte('date', new Date().toISOString().slice(0, 10))
        .order('date', { ascending: true })
        .limit(5);

      setWalks(walkBlocks || []);

      const { data: bookingData } = walkBlocks && walkBlocks.length > 0
        ? await supabase
            .from('walker_bookings')
            .select('id, status, walk_block_id, dog_id')
            .in('walk_block_id', walkBlocks.map(w => w.id))
            .order('created_at', { ascending: false })
            .limit(5)
        : { data: [] };

      setBookings(bookingData || []);
      setLoading(false);
    }
    fetchWalkerData();
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-[#68902b] mb-1">Walker Dashboard</h1>
        {loading ? (
          <div className="text-center py-16 text-2xl text-[#68902b]">Loading your dashboard...</div>
        ) : !walker ? (
          <div className="text-center text-lg py-16 text-[#68902b]">Walker profile not found.</div>
        ) : (
          <>
            <section className="mb-8 flex items-center gap-6">
              {walker.photo_url && (
                <Image
                  src={walker.photo_url}
                  alt="Walker profile"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full border-4 border-[#a3c75c] object-cover"
                  unoptimized
                />
              )}
              <div>
                <div className="text-2xl font-bold text-[#68902b]">{walker.name}</div>
                <div className="text-[#a3c75c]">{walker.about}</div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#68902b]">Upcoming Walks</h2>
              {walks.length === 0 ? (
                <div className="text-[#68902b]">No upcoming walks.</div>
              ) : (
                <ul className="space-y-2">
                  {walks.map(walk => (
                    <li key={walk.id} className="bg-[#f6f3ee] rounded-xl px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <b>{walk.title}</b> — {walk.date} ({walk.start_time}-{walk.end_time}) [{walk.is_group ? "Group" : "Solo"}]
                      </div>
                      <button
                        className="text-[#68902b] underline mt-2 sm:mt-0 sm:ml-3"
                        onClick={() => router.push(`/walkers/walks?block=${walk.id}`)}
                      >
                        Details
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <Link href="/walkers/walks" className="text-[#68902b] underline">
                  View All Walks
                </Link>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#68902b]">Recent Bookings</h2>
              {bookings.length === 0 ? (
                <div className="text-[#68902b]">No recent bookings.</div>
              ) : (
                <ul className="space-y-2">
                  {bookings.map(bk => (
                    <li key={bk.id} className="bg-[#f6f3ee] rounded-xl px-4 py-2 flex justify-between items-center">
                      <div>
                        Walk block: <b>{bk.walk_block_id}</b><br />
                        Status: {bk.status}
                      </div>
                      <button
                        className="text-[#68902b] underline"
                        onClick={() => router.push(`/walkers/bookings?booking=${bk.id}`)}
                      >
                        Details
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <Link href="/walkers/bookings" className="text-[#68902b] underline">
                  View All Bookings
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[#68902b]">Your Dogs</h2>
              <Link href="/walkers/dogs" className="text-[#68902b] underline">
                View Dog List
              </Link>
            </section>
          </>
        )}
      </main>
    </>
  );
}
