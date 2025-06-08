'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { supabase } from '../../../../lib/supabaseClient';

type WalkBlock = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  is_group: boolean;
  capacity: number;
};

export default function WalkBlocksPage() {
  const [walks, setWalks] = useState<WalkBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useSearchParams();
  const selectedBlock = params?.get('block');

  useEffect(() => {
    async function fetchWalks() {
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
        setWalks([]);
        setLoading(false);
        return;
      }

      const { data: walksData } = await supabase
        .from('walk_blocks')
        .select('*')
        .eq('walker_id', walkerData.id)
        .order('date', { ascending: true });

      setWalks(walksData || []);
      setLoading(false);
    }
    fetchWalks();
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-[#68902b] mb-8">Your Walk Blocks</h1>
        {loading ? (
          <div className="text-center py-16 text-2xl text-[#68902b]">Loading walks...</div>
        ) : walks.length === 0 ? (
          <div className="text-center text-lg text-[#68902b] py-16">No walks found.</div>
        ) : (
          <ul className="space-y-4">
            {walks.map(walk => (
              <li key={walk.id} className={`p-4 rounded-xl ${selectedBlock === walk.id ? "border-4 border-[#68902b]" : "bg-[#f6f3ee] border-2 border-[#dbc7a1]"}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg text-[#68902b]">{walk.title}</div>
                    <div>{walk.date} {walk.start_time}-{walk.end_time} [{walk.is_group ? "Group" : "Solo"}] (Capacity: {walk.capacity})</div>
                  </div>
                  <button
                    className="text-[#68902b] underline"
                    onClick={() => router.push(`/walkers/walks?block=${walk.id}`)}
                  >
                    View Bookings
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
